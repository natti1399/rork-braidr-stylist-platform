import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { AppointmentService } from '../services/appointmentService';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError, sendCreated, sendNotFound } from '../utils/response';
import { sanitizePaginationParams } from '../utils/response';
import { AppointmentStatus } from '../types';

export class AppointmentController {
  /**
   * Create a new appointment
   */
  static createAppointment = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.user?.userId;
    const { stylistId, serviceId, appointmentDateTime, notes, customerAddress } = req.body;

    if (!stylistId || !serviceId || !appointmentDateTime) {
      return sendError(res, 'Stylist ID, Service ID, and appointment date/time are required', 400);
    }

    if (!customerAddress || !customerAddress.street || !customerAddress.city || !customerAddress.state || !customerAddress.zipCode) {
      return sendError(res, 'Complete customer address is required', 400);
    }

    // Extract date and time from appointmentDateTime
    const scheduledDate = new Date(appointmentDateTime);
    const scheduledTime = appointmentDateTime.includes('T') ? 
      appointmentDateTime.split('T')[1].split(':').slice(0, 2).join(':') : '09:00';
    
    // Get service details for duration and price
    const { data: service } = await supabase
      .from('braiding_services')
      .select('duration, price')
      .eq('id', serviceId)
      .single();
    
    if (!service) {
      return sendError(res, 'Service not found', 404);
    }

    const appointment = await AppointmentService.createAppointment({
      customerId: customerId!,
      stylistId,
      serviceId,
      scheduledDate,
      scheduledTime,
      duration: service.duration,
      totalPrice: service.price,
      notes,
      customerAddress
    });

    sendCreated(res, { appointment }, 'Appointment created successfully');
  });

  /**
   * Get appointment by ID
   */
  static getAppointment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { appointmentId } = req.params;

    const appointment = await AppointmentService.getAppointmentById(appointmentId);

    if (!appointment) {
      return sendNotFound(res, 'Appointment not found');
    }

    // Check if user is authorized to view this appointment
    if (appointment.customerId !== userId && appointment.stylistId !== userId) {
      return sendError(res, 'Not authorized to view this appointment', 403);
    }

    sendSuccess(res, { appointment });
  });

  /**
   * Update appointment
   */
  static updateAppointment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { appointmentId } = req.params;
    const updateData = req.body;

    const appointment = await AppointmentService.getAppointmentById(appointmentId);

    if (!appointment) {
      return sendNotFound(res, 'Appointment not found');
    }

    // Check if user is authorized to update this appointment
    if (appointment.customerId !== userId && appointment.stylistId !== userId) {
      return sendError(res, 'Not authorized to update this appointment', 403);
    }

    const updatedAppointment = await AppointmentService.updateAppointment(appointmentId, updateData);

    sendSuccess(res, { appointment: updatedAppointment }, 'Appointment updated successfully');
  });

  /**
   * Cancel appointment
   */
  static cancelAppointment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { appointmentId } = req.params;
    const { reason } = req.body;

    const appointment = await AppointmentService.getAppointmentById(appointmentId);

    if (!appointment) {
      return sendNotFound(res, 'Appointment not found');
    }

    // Check if user is authorized to cancel this appointment
    if (appointment.customerId !== userId && appointment.stylistId !== userId) {
      return sendError(res, 'Not authorized to cancel this appointment', 403);
    }

    const cancelledAppointment = await AppointmentService.cancelAppointment(appointmentId, reason);

    sendSuccess(res, { appointment: cancelledAppointment }, 'Appointment cancelled successfully');
  });

  /**
   * Confirm appointment (stylist only)
   */
  static confirmAppointment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { appointmentId } = req.params;

    const appointment = await AppointmentService.getAppointmentById(appointmentId);

    if (!appointment) {
      return sendNotFound(res, 'Appointment not found');
    }

    // Only stylist can confirm
    if (appointment.stylistId !== userId) {
      return sendError(res, 'Only the stylist can confirm this appointment', 403);
    }

    const confirmedAppointment = await AppointmentService.confirmAppointment(appointmentId);

    sendSuccess(res, { appointment: confirmedAppointment }, 'Appointment confirmed successfully');
  });

  /**
   * Complete appointment (stylist only)
   */
  static completeAppointment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { appointmentId } = req.params;
    const { notes } = req.body;

    const appointment = await AppointmentService.getAppointmentById(appointmentId);

    if (!appointment) {
      return sendNotFound(res, 'Appointment not found');
    }

    // Only stylist can complete
    if (appointment.stylistId !== userId) {
      return sendError(res, 'Only the stylist can complete this appointment', 403);
    }

    const completedAppointment = await AppointmentService.completeAppointment(appointmentId, notes);

    sendSuccess(res, { appointment: completedAppointment }, 'Appointment completed successfully');
  });

  // Payment processing removed - Braidr is booking-only

  /**
   * Get user's appointments
   */
  static getUserAppointments = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { page = 1, limit = 10, status } = req.query;

    const paginationParams = sanitizePaginationParams(Number(page), Number(limit));
    
    const result = await AppointmentService.getUserAppointments(
      userId!,
      status as AppointmentStatus,
      paginationParams
    );

    sendSuccess(res, result);
  });

  /**
   * Get stylist's appointments
   */
  static getStylistAppointments = asyncHandler(async (req: Request, res: Response) => {
    const { stylistId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const paginationParams = sanitizePaginationParams(Number(page), Number(limit));
    
    const result = await AppointmentService.getStylistAppointments(
      stylistId,
      status as AppointmentStatus,
      paginationParams
    );

    sendSuccess(res, result);
  });

  /**
   * Get appointment availability for a stylist
   */
  static getStylistAvailability = asyncHandler(async (req: Request, res: Response) => {
    const { stylistId } = req.params;
    const { date } = req.query;

    if (!date) {
      return sendError(res, 'Date is required', 400);
    }

    const availability = await AppointmentService.getStylistAvailability(stylistId, new Date(date as string));

    sendSuccess(res, { availability });
  });
}