import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Opportunity, Token, Alert } from '../models';
import { IOpportunity } from '../models/Opportunity';
import { IToken } from '../models/Token';
import { IAlert } from '../models/Alert';
import { Types } from 'mongoose';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, Set<string>> = new Map();

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    console.log('🔌 WebSocket service initialized');
  }

  private setupMiddleware(): void {
    if (!this.io) return;

    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        
        (socket as AuthenticatedSocket).userId = decoded.id;
        (socket as AuthenticatedSocket).userEmail = decoded.email;
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;
      console.log(`🔌 User ${authSocket.userEmail} connected (${socket.id})`);

      if (authSocket.userId) {
        if (!this.connectedUsers.has(authSocket.userId)) {
          this.connectedUsers.set(authSocket.userId, new Set());
        }
        this.connectedUsers.get(authSocket.userId)!.add(socket.id);
      }

      if (authSocket.userId) {
        socket.join(`user:${authSocket.userId}`);
      }

      socket.on('subscribe', (data: { type: string; filters?: any }) => {
        this.handleSubscription(authSocket, data);
      });

      socket.on('unsubscribe', (data: { type: string }) => {
        this.handleUnsubscription(authSocket, data);
      });

      socket.on('create_alert', (data: { message: string; priority: string }) => {
        this.handleCreateAlert(authSocket, data);
      });

      socket.on('disconnect', () => {
        console.log(`🔌 User ${authSocket.userEmail} disconnected (${socket.id})`);
        
        if (authSocket.userId) {
          const userSockets = this.connectedUsers.get(authSocket.userId);
          if (userSockets) {
            userSockets.delete(socket.id);
            if (userSockets.size === 0) {
              this.connectedUsers.delete(authSocket.userId);
            }
          }
        }
      });
    });
  }

  /**
   * Handle subscription to data types
   */
  private handleSubscription(socket: AuthenticatedSocket, data: { type: string; filters?: any }): void {
    const { type, filters } = data;
    
    switch (type) {
      case 'opportunities':
        socket.join('opportunities');
        if (filters) {
          socket.join(`opportunities:${JSON.stringify(filters)}`);
        }
        break;
      case 'tokens':
        socket.join('tokens');
        break;
      case 'alerts':
        if (socket.userId) {
          socket.join(`alerts:${socket.userId}`);
        }
        break;
      case 'system':
        socket.join('system');
        break;
      default:
        socket.emit('error', { message: `Unknown subscription type: ${type}` });
    }
  }

  /**
   * Handle unsubscription from data types
   */
  private handleUnsubscription(socket: AuthenticatedSocket, data: { type: string }): void {
    const { type } = data;
    
    switch (type) {
      case 'opportunities':
        socket.leave('opportunities');
        break;
      case 'tokens':
        socket.leave('tokens');
        break;
      case 'alerts':
        if (socket.userId) {
          socket.leave(`alerts:${socket.userId}`);
        }
        break;
      case 'system':
        socket.leave('system');
        break;
    }
  }

  private async handleCreateAlert(socket: AuthenticatedSocket, data: { message: string; priority: string }): Promise<void> {
    if (!socket.userId) {
      socket.emit('error', { message: 'User not authenticated' });
      return;
    }

    try {
      const alert = await Alert.create({
        userId: new Types.ObjectId(socket.userId),
        message: data.message,
        alertType: 'custom',
        priority: data.priority as IAlert['priority'],
        isRead: false,
      });

      this.io?.to(`alerts:${socket.userId}`).emit('new_alert', alert);
      
      socket.emit('alert_created', { success: true, alert });
    } catch (error) {
      socket.emit('error', { message: 'Failed to create alert' });
    }
  }

  public broadcastNewOpportunity(opportunity: IOpportunity): void {
    if (!this.io) return;

    this.io.to('opportunities').emit('new_opportunity', {
      type: 'new_opportunity',
      data: opportunity,
      timestamp: new Date(),
    });
  }

  public broadcastUpdatedOpportunity(opportunity: IOpportunity): void {
    if (!this.io) return;

    this.io.to('opportunities').emit('updated_opportunity', {
      type: 'updated_opportunity',
      data: opportunity,
      timestamp: new Date(),
    });
  }

  public broadcastExpiredOpportunity(opportunity: IOpportunity): void {
    if (!this.io) return;

    this.io.to('opportunities').emit('expired_opportunity', {
      type: 'expired_opportunity',
      data: opportunity,
      timestamp: new Date(),
    });
  }

  public broadcastTokenPriceUpdate(token: IToken): void {
    if (!this.io) return;

    this.io.to('tokens').emit('token_price_update', {
      type: 'token_price_update',
      data: token,
      timestamp: new Date(),
    });
  }

  public broadcastNewAlert(userId: string, alert: IAlert): void {
    if (!this.io) return;

    this.io.to(`alerts:${userId}`).emit('new_alert', {
      type: 'new_alert',
      data: alert,
      timestamp: new Date(),
    });
  }

  public broadcastSystemStatus(status: any): void {
    if (!this.io) return;

    this.io.to('system').emit('system_status', {
      type: 'system_status',
      data: status,
      timestamp: new Date(),
    });
  }

  public broadcastScanResults(results: {
    opportunitiesFound: number;
    opportunitiesUpdated: number;
    opportunitiesExpired: number;
    errors: string[];
  }): void {
    if (!this.io) return;

    this.io.to('system').emit('scan_results', {
      type: 'scan_results',
      data: results,
      timestamp: new Date(),
    });
  }


  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getTotalConnectionsCount(): number {
    let total = 0;
    for (const sockets of Array.from(this.connectedUsers.values())) {
      total += sockets.size;
    }
    return total;
  }
  public getConnectionStats(): {
    connectedUsers: number;
    totalConnections: number;
    users: Array<{ userId: string; connectionCount: number }>;
  } {
    const users: Array<{ userId: string; connectionCount: number }> = [];
    
    for (const [userId, sockets] of Array.from(this.connectedUsers.entries())) {
      users.push({
        userId,
        connectionCount: sockets.size,
      });
    }

    return {
      connectedUsers: this.connectedUsers.size,
      totalConnections: this.getTotalConnectionsCount(),
      users,
    };
  }
}

export default WebSocketService;
