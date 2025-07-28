import { supabase } from '../config/database';
import { Appointment, AppointmentStatus, PaymentStatus } from '../types';
import { generateUUID, doDateRangesOverlap, isFutureDate } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

export class AppointmentService {
  /**
   * Create a new appointment
   */
  static async createAppointment(appointmentData: {
    customerId: string;
    stylistId: string;
    serviceId: string;
    scheduledDate: Date;
    scheduledTime: string;
    duration: number;
    totalPrice: number;
    notes?: string;
    customerAddress?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  }): Promise<Appointment> {
    const {
      customerId,
      stylistId,
      serviceId,
      scheduledDate,
      scheduledTime,
      duration,
      totalPrice,
      notes,
      customerAddress
    } = appointmentData;

    // Validate future date
    if (!isFutureDate(scheduledDate)) {
      throw new AppError('Appointment must be scheduled for a future date', 400);
    }

    // Check if stylist exists and is available
    const { data: stylist } = await supabase
      .from('stylist_profiles')
      .select('is_available, business_hours')
      .eq('user_id', stylistId)
      .single();

    if (!stylist) {
      throw new AppError('Stylist not found', 404);
    }

    if (!stylist.is_available) {
      throw new AppError('Stylist is not currently available', 400);
    }

    // Check if service exists and belongs to stylist
    const { data: service } = await supabase
      .from('braiding_services')
      .select('id, duration, base_price')
      .eq('id', serviceId)
      .eq('stylist_id', stylistId)
      .eq('is_active', true)
      .single();

    if (!service) {
      throw new AppError('Service not found or not available', 404);
    }

    // Check for scheduling conflicts
    const appointmentStart = new Date(`${scheduledDate.toISOString().split('T')[0]}T${scheduledTime}`);
    const appointmentEnd = new Date(appointmentStart.getTime() + duration * 60000);

    const { data: conflictingAppointments } = await supabase
      .from('appointments')
      .select('scheduled_date, scheduled_time, duration')
      .eq('stylist_id', stylistId)
      .in('status', ['pending', 'confirmed'])
      .eq('scheduled_date', scheduledDate.toISOString().split('T')[0]);

    if (conflictingAppointments) {
      for (const existing of conflictingAppointments) {
        const existingStart = new Date(`${existing.scheduled_date}T${existing.scheduled_time}`);
        const existingEnd = new Date(existingStart.getTime() + existing.duration * 60000);
        
        if (doDateRangesOverlap(appointmentStart, appointmentEnd, existingStart, existingEnd)) {
          throw new AppError('Time slot is not available', 409);
        }
      }
    }

    const appointmentId = generateUUID();
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        id: appointmentId,
        customer_id: customerId,
        stylist_id: stylistId,
        service_id: serviceId,
        scheduled_date: scheduledDate.toISOString().split('T')[0],
        scheduled_time: scheduledTime,
        duration,
        total_price: totalPrice,
        notes,
        customer_address: customerAddress,
        status: AppointmentStatus.PENDING,
        payment_status: PaymentStatus.PENDING,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create appointment', 500);
    }

    return appointment;
  }

  /**
   * Get appointment by ID
   */
  static async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customers:users!customer_id(
          id,
          first_name,
          last_name,
          email,
          phone_number,
          profile_picture_url
        ),
        stylists:users!stylist_id(
          id,
          first_name,
          last_name,
          email,
          phone_number,
          profile_picture_url
        ),
        services:braiding_services!service_id(
          id,
          name,
          description,
          category,
          base_price,
          images
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) {
      return null;
    }

    return appointment;
  }

  /**
   * Get appointments for customer
   */
  static async getCustomerAppointments(
    customerId: string,
    status?: AppointmentStatus,
    page: number = 1,
    limit: number = 10
  ) {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        stylists:users!stylist_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        ),
        services:braiding_services!service_id(
          id,
          name,
          category,
          base_price,
          images
        )
      `, { count: 'exact' })
      .eq('customer_id', customerId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: appointments, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('scheduled_date', { ascending: false })
      .order('scheduled_time', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch customer appointments', 500);
    }

    return {
      appointments: appointments || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Get appointments for stylist
   */
  static async getStylistAppointments(
    stylistId: string,
    status?: AppointmentStatus,
    page: number = 1,
    limit: number = 10
  ) {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        customers:users!customer_id(
          id,
          first_name,
          last_name,
          profile_picture_url,
          phone_number
        ),
        services:braiding_services!service_id(
          id,
          name,
          category,
          base_price
        )
      `, { count: 'exact' })
      .eq('stylist_id', stylistId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: appointments, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (error) {
      throw new AppError('Failed to fetch stylist appointments', 500);
    }

    return {
      appointments: appointments || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Update appointment status
   */
  static async updateAppointmentStatus(
    appointmentId: string,
    userId: string,
    newStatus: AppointmentStatus,
    userType: 'customer' | 'stylist'
  ): Promise<Appointment> {
    // Get current appointment
    const { data: appointment } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Verify user has permission to update this appointment
    const userIdField = userType === 'customer' ? 'customer_id' : 'stylist_id';
    if (appointment[userIdField] !== userId) {
      throw new AppError('Not authorized to update this appointment', 403);
    }

    // Validate status transition
    const validTransitions = this.getValidStatusTransitions(appointment.status, userType);
    if (!validTransitions.includes(newStatus)) {
      throw new AppError(`Invalid status transition from ${appointment.status} to ${newStatus}`, 400);
    }

    const { data: updatedAppointment, error } = await supabase
      .from('appointments')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update appointment status', 500);
    }

    return updatedAppointment;
  }

  /**
   * Get valid status transitions
   */
  private static getValidStatusTransitions(
    currentStatus: AppointmentStatus,
    userType: 'customer' | 'stylist'
  ): AppointmentStatus[] {
    const transitions: { [key: string]: { [key: string]: AppointmentStatus[] } } = {
      [AppointmentStatus.PENDING]: {
        customer: [AppointmentStatus.CANCELLED],
        stylist: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED]
      },
      [AppointmentStatus.CONFIRMED]: {
        customer: [AppointmentStatus.CANCELLED],
        stylist: [AppointmentStatus.IN_PROGRESS, AppointmentStatus.CANCELLED]
      },
      [AppointmentStatus.IN_PROGRESS]: {
        customer: [],
        stylist: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]
      },
      [AppointmentStatus.COMPLETED]: {
        customer: [],
        stylist: []
      },
      [AppointmentStatus.CANCELLED]: {
        customer: [],
        stylist: []
      }
    };

    return transitions[currentStatus]?.[userType] || [];
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(
    appointmentId: string,
    paymentStatus: PaymentStatus,
    paymentIntentId?: string
  ): Promise<Appointment> {
    const updateFields: any = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    };

    if (paymentIntentId) {
      updateFields.payment_intent_id = paymentIntentId;
    }

    if (paymentStatus === PaymentStatus.PAID) {
      updateFields.paid_at = new Date().toISOString();
    }

    const { data: appointment, error } = await supabase
      .from('appointments')
      .update(updateFields)
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update payment status', 500);
    }

    return appointment;
  }

  /**
   * Get available time slots for a stylist on a specific date
   */
  static async getAvailableTimeSlots(
    stylistId: string,
    date: Date,
    serviceDuration: number
  ): Promise<string[]> {
    // Get stylist's business hours
    const { data: stylist } = await supabase
      .from('stylist_profiles')
      .select('business_hours')
      .eq('user_id', stylistId)
      .single();

    if (!stylist) {
      throw new AppError('Stylist not found', 404);
    }

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const businessHours = stylist.business_hours[dayOfWeek];

    if (!businessHours || !businessHours.isOpen) {
      return [];
    }

    // Get existing appointments for the date
    const { data: appointments } = await supabase
      .from('appointments')
      .select('scheduled_time, duration')
      .eq('stylist_id', stylistId)
      .eq('scheduled_date', date.toISOString().split('T')[0])
      .in('status', ['pending', 'confirmed', 'in_progress']);

    // Generate all possible time slots
    const availableSlots: string[] = [];
    const startTime = this.parseTime(businessHours.startTime);
    const endTime = this.parseTime(businessHours.endTime);
    const slotDuration = 30; // 30-minute slots

    for (let time = startTime; time + serviceDuration <= endTime; time += slotDuration) {
      const timeString = this.formatTime(time);
      const slotEnd = time + serviceDuration;

      // Check if this slot conflicts with existing appointments
      const hasConflict = appointments?.some(apt => {
        const aptStart = this.parseTime(apt.scheduled_time);
        const aptEnd = aptStart + apt.duration;
        return (time < aptEnd && slotEnd > aptStart);
      });

      if (!hasConflict) {
        availableSlots.push(timeString);
      }
    }

    return availableSlots;
  }

  /**
   * Parse time string to minutes
   */
  private static parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Format minutes to time string
   */
  private static formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Get appointment statistics for stylist
   */
  static async getStylistAppointmentStats(stylistId: string) {
    const { data: appointments } = await supabase
      .from('appointments')
      .select('status, total_price, created_at')
      .eq('stylist_id', stylistId);

    const total = appointments?.length || 0;
    const completed = appointments?.filter(apt => apt.status === AppointmentStatus.COMPLETED).length || 0;
    const pending = appointments?.filter(apt => apt.status === AppointmentStatus.PENDING).length || 0;
    const confirmed = appointments?.filter(apt => apt.status === AppointmentStatus.CONFIRMED).length || 0;
    const cancelled = appointments?.filter(apt => apt.status === AppointmentStatus.CANCELLED).length || 0;
    
    const totalRevenue = appointments
      ?.filter(apt => apt.status === AppointmentStatus.COMPLETED)
      .reduce((sum, apt) => sum + (apt.total_price || 0), 0) || 0;

    return {
      total,
      completed,
      pending,
      confirmed,
      cancelled,
      totalRevenue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  /**
   * Reschedule appointment
   */
  static async rescheduleAppointment(
    appointmentId: string,
    userId: string,
    newDate: Date,
    newTime: string,
    userType: 'customer' | 'stylist'
  ): Promise<Appointment> {
    // Get current appointment
    const { data: appointment } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Verify user has permission
    const userIdField = userType === 'customer' ? 'customer_id' : 'stylist_id';
    if (appointment[userIdField] !== userId) {
      throw new AppError('Not authorized to reschedule this appointment', 403);
    }

    // Validate appointment can be rescheduled
    if (![AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED].includes(appointment.status)) {
      throw new AppError('Appointment cannot be rescheduled', 400);
    }

    // Validate future date
    if (!isFutureDate(newDate)) {
      throw new AppError('Appointment must be rescheduled for a future date', 400);
    }

    // Check for conflicts at new time
    const appointmentStart = new Date(`${newDate.toISOString().split('T')[0]}T${newTime}`);
    const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60000);

    const { data: conflictingAppointments } = await supabase
      .from('appointments')
      .select('id, scheduled_date, scheduled_time, duration')
      .eq('stylist_id', appointment.stylist_id)
      .in('status', ['pending', 'confirmed'])
      .eq('scheduled_date', newDate.toISOString().split('T')[0])
      .neq('id', appointmentId);

    if (conflictingAppointments) {
      for (const existing of conflictingAppointments) {
        const existingStart = new Date(`${existing.scheduled_date}T${existing.scheduled_time}`);
        const existingEnd = new Date(existingStart.getTime() + existing.duration * 60000);
        
        if (doDateRangesOverlap(appointmentStart, appointmentEnd, existingStart, existingEnd)) {
          throw new AppError('New time slot is not available', 409);
        }
      }
    }

    const { data: updatedAppointment, error } = await supabase
      .from('appointments')
      .update({
        scheduled_date: newDate.toISOString().split('T')[0],
        scheduled_time: newTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to reschedule appointment', 500);
    }

    return updatedAppointment;
  }
}