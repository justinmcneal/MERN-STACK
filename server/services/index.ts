// Export all services
export { default as DataService } from './DataService';
export { default as MLService } from './MLService';
export { default as WebSocketService } from './WebSocketService';

// Export service instances
import DataService from './DataService';
import MLService from './MLService';
import WebSocketService from './WebSocketService';

export const dataService = DataService.getInstance();
export const mlService = MLService.getInstance();
export const webSocketService = WebSocketService.getInstance();
