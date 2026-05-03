import { body } from 'express-validator';
import { AppointmentStatus } from '../types';

/**
 * Validador para la creación de una cita médica.
 * Asegura que el ID del doctor sea válido, la fecha tenga formato YYYY-MM-DD,
 * la hora esté en formato de 24 horas (HH:MM) y se asigne un consultorio.
 * Las reglas de agenda laboral (lunes a sábado, bloques permitidos y
 * anticipación mínima del mismo día) se refuerzan posteriormente en la capa
 * de servicios para no acoplar la política operativa al transporte HTTP.
 */
export const createAppointmentValidator = [
  body('doctorId').isUUID().withMessage('doctorId debe ser un UUID válido'),
  body('fecha').isDate({ format: 'YYYY-MM-DD' }).withMessage('Fecha inválida. Formato: YYYY-MM-DD'),
  body('hora')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora inválida. Formato: HH:MM (24 horas)'),
  body('consultorio').trim().notEmpty().withMessage('El consultorio es requerido'),
];

/**
 * Validador para la actualización del estado de una cita.
 * Verifica que el nuevo estado sea válido y que se provean recomendaciones si la cita es marcada como atendida.
 */
export const updateAppointmentValidator = [
  body('estado')
    .isIn(Object.values(AppointmentStatus))
    .withMessage(`Estado inválido. Valores: ${Object.values(AppointmentStatus).join(', ')}`),
  body('recomendaciones')
    .if(body('estado').equals(AppointmentStatus.ATENDIDA))
    .notEmpty()
    .withMessage('Las recomendaciones son requeridas cuando el estado es "atendida"'),
];

/**
 * Validador para la reprogramación de citas.
 * Se valida formato en esta capa y la política horaria completa en servicios.
 */
export const rescheduleAppointmentValidator = [
  body('fecha').isDate({ format: 'YYYY-MM-DD' }).withMessage('Fecha inválida. Formato: YYYY-MM-DD'),
  body('hora')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora inválida. Formato: HH:MM (24 horas)'),
];
