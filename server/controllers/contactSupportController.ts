import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { createError } from '../middleware/errorMiddleware';
import ContactSupportService from '../services/ContactSupportService';

export const submitContactSupport = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { fullName, email, phoneNumber, subject, message, priorityLevel } = req.body;
    
    if (!fullName || !email || !subject || !message) {
      throw createError('Full name, email, subject, and message are required', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError('Please provide a valid email address', 400);
    }

    const validPriorities = ['Low', 'Medium', 'High'];
    if (priorityLevel && !validPriorities.includes(priorityLevel)) {
      throw createError('Priority level must be Low, Medium, or High', 400);
    }

    const result = await ContactSupportService.submitSupportTicket({
      fullName,
      email,
      phoneNumber: phoneNumber || '',
      subject,
      message,
      priorityLevel: priorityLevel || 'Low'
    });
    
    res.json({
      success: true,
      message: result.message,
      ticketId: result.ticketId
    });
  } catch (error: any) {
    throw error;
  }
});

export default {
  submitContactSupport
};
