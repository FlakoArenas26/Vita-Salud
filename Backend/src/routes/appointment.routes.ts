import { Router } from 'express';
import appointmentController from '../controllers/appointment.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createAppointmentValidator, updateAppointmentValidator, rescheduleAppointmentValidator } from '../validators/appointment.validator';
import { UserRole } from '../types';

const router = Router();

// POST /api/appointments - solo pacientes pueden agendar
router.post(
  '/',
  verifyToken,
  checkRole(UserRole.PACIENTE),
  createAppointmentValidator,
  validate,
  appointmentController.create.bind(appointmentController)
);

// GET /api/appointments - cada rol ve las suyas
router.get('/', verifyToken, appointmentController.getAll.bind(appointmentController));

// GET /api/appointments/availability/:doctorId
router.get('/availability/:doctorId', verifyToken, appointmentController.getAvailability.bind(appointmentController));

// GET /api/appointments/:id
router.get('/:id', verifyToken, appointmentController.getById.bind(appointmentController));

// PATCH /api/appointments/:id - médico atiende/cancela, paciente cancela
router.patch(
  '/:id',
  verifyToken,
  checkRole(UserRole.MEDICO, UserRole.PACIENTE, UserRole.ADMIN),
  updateAppointmentValidator,
  validate,
  appointmentController.updateStatus.bind(appointmentController)
);

// PATCH /api/appointments/:id/reschedule - solo paciente reprograma
router.patch(
  '/:id/reschedule',
  verifyToken,
  checkRole(UserRole.PACIENTE),
  rescheduleAppointmentValidator,
  validate,
  appointmentController.reschedule.bind(appointmentController)
);

export default router;
