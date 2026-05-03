import { Request, Response } from 'express';
import appointmentService from '../services/appointment.service';
import { sendSuccess, sendError } from '../utils/response';
import { CreateAppointmentDto, UpdateAppointmentDto, RescheduleAppointmentDto } from '../types';

export class AppointmentController {
  /**
   * Crea una nueva cita médica para el paciente autenticado.
   *
   * @param {Request} req Solicitud HTTP con los datos de la cita.
   * @param {Response} res Respuesta HTTP.
   * @returns {Promise<void>}
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const appointment = await appointmentService.create(req.user!.sub, req.body as CreateAppointmentDto);
      sendSuccess(res, appointment, 201, 'Cita agendada exitosamente');
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  /**
   * Lista las citas visibles para el usuario autenticado.
   *
   * @param {Request} req Solicitud HTTP con el contexto del usuario autenticado.
   * @param {Response} res Respuesta HTTP.
   * @returns {Promise<void>}
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const appointments = await appointmentService.getAll(req.user!.sub, req.user!.rol);
      sendSuccess(res, appointments);
    } catch (error) {
      sendError(res, (error as Error).message, 500);
    }
  }

  /**
   * Obtiene una cita puntual por su identificador.
   *
   * @param {Request} req Solicitud HTTP con el ID de la cita en params.
   * @param {Response} res Respuesta HTTP.
   * @returns {Promise<void>}
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const appointment = await appointmentService.getById(req.params.id, req.user!.sub, req.user!.rol);
      sendSuccess(res, appointment);
    } catch (error) {
      const msg = (error as Error).message;
      sendError(res, msg, msg.includes('permiso') ? 403 : 404);
    }
  }

  /**
   * Cambia el estado de una cita respetando permisos y reglas de negocio.
   *
   * @param {Request} req Solicitud HTTP con el ID de la cita y el nuevo estado.
   * @param {Response} res Respuesta HTTP.
   * @returns {Promise<void>}
   */
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const appointment = await appointmentService.updateStatus(
        req.params.id,
        req.body as UpdateAppointmentDto,
        req.user!.sub,
        req.user!.rol
      );
      sendSuccess(res, appointment, 200, 'Cita actualizada');
    } catch (error) {
      const msg = (error as Error).message;
      sendError(res, msg, msg.includes('permiso') || msg.includes('Sin permiso') ? 403 : 400);
    }
  }

  /**
   * Reprograma una cita agendada con una nueva fecha y hora.
   *
   * @param {Request} req Solicitud HTTP con el ID de la cita y la nueva franja.
   * @param {Response} res Respuesta HTTP.
   * @returns {Promise<void>}
   */
  async reschedule(req: Request, res: Response): Promise<void> {
    try {
      const appointment = await appointmentService.reschedule(
        req.params.id,
        req.body as RescheduleAppointmentDto,
        req.user!.sub,
        req.user!.rol
      );
      sendSuccess(res, appointment, 200, 'Cita reprogramada exitosamente');
    } catch (error) {
      const msg = (error as Error).message;
      sendError(res, msg, msg.includes('permiso') || msg.includes('Sin permiso') ? 403 : 400);
    }
  }

  /**
   * Maneja la petición para obtener la disponibilidad de horas de un médico.
   * Valida la fecha ingresada y responde con el arreglo de horas ocupadas.
   *
   * @param {Request} req - Objeto de petición de Express, debe contener doctorId en params y fecha en query.
   * @param {Response} res - Objeto de respuesta de Express.
   * @returns {Promise<void>} Promesa que maneja la respuesta HTTP.
   */
  async getAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId } = req.params;
      const { fecha } = req.query;

      if (!fecha || typeof fecha !== 'string') {
        sendError(res, 'La fecha es requerida en formato YYYY-MM-DD', 400);
        return;
      }

      const bookedHours = await appointmentService.getDoctorAvailability(doctorId, fecha);
      sendSuccess(res, bookedHours);
    } catch (error) {
      sendError(res, (error as Error).message, 500);
    }
  }
}

export default new AppointmentController();
