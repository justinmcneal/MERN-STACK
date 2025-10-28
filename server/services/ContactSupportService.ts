import { createError } from '../middleware/errorMiddleware';
import { EmailService } from './EmailService';
import logger from '../utils/logger';

export interface ContactSupportData {
  fullName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
  priorityLevel: 'Low' | 'Medium' | 'High';
}

export interface ContactSupportResult {
  success: boolean;
  message: string;
  ticketId: string;
}

class ContactSupportService {
  static async submitSupportTicket(data: ContactSupportData): Promise<ContactSupportResult> {
    try {
      const ticketId = this.generateTicketId();
      
      await EmailService.sendSupportTicketConfirmation(
        data.email,
        data.fullName,
        ticketId,
        data.subject,
        data.priorityLevel
      );

      await EmailService.sendSupportTicketNotification(
        data.fullName,
        data.email,
        data.phoneNumber,
        data.subject,
        data.message,
        data.priorityLevel,
        ticketId
      );

      return {
        success: true,
        message: 'Your support ticket has been submitted successfully. We will get back to you within 2 hours.',
        ticketId
      };
    } catch (error) {
      logger.error('ContactSupportService: Error submitting support ticket:', error);
      throw createError('Failed to submit support ticket. Please try again.', 500);
    }
  }

  private static generateTicketId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `SUP-${timestamp}-${randomStr}`.toUpperCase();
  }
}

export default ContactSupportService;
