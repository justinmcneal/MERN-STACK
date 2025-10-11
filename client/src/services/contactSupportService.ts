import { apiClient } from './api';

export interface ContactSupportData {
  fullName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
  priorityLevel: 'Low' | 'Medium' | 'High';
}

export interface ContactSupportResponse {
  success: boolean;
  message: string;
  ticketId?: string;
}

class ContactSupportService {
  /**
   * Submit a support ticket
   */
  static async submitSupportTicket(data: ContactSupportData): Promise<ContactSupportResponse> {
    try {
      console.log('🌐 [ContactSupportService] Submitting support ticket...');
      console.log('🌐 [ContactSupportService] Ticket data:', {
        fullName: data.fullName,
        email: data.email,
        subject: data.subject,
        priorityLevel: data.priorityLevel,
        hasMessage: !!data.message,
        hasPhone: !!data.phoneNumber
      });

      const response = await apiClient.post('/support/contact', data);
      
      console.log('🌐 [ContactSupportService] Support ticket submitted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('🌐 [ContactSupportService] Error submitting support ticket:', error);
      
      if (this.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Failed to submit support ticket';
        throw new Error(message);
      }
      throw new Error('Network error occurred');
    }
  }

  /**
   * Check if error is an Axios error
   */
  private static isAxiosError(error: unknown): error is { response?: { data?: { message?: string } } } {
    return typeof error === 'object' && error !== null && 'response' in error;
  }
}

export default ContactSupportService;
