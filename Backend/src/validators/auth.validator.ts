import { body } from 'express-validator';
import { DocumentType } from '../types';

export const loginValidator = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
];

const passwordRules = body('newPassword')
  .isLength({ min: 12 })
  .withMessage('La nueva contraseña debe tener mínimo 12 caracteres')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
  .withMessage('La nueva contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (!@#$%^&*)');

export const registerPatientValidator = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password')
    .isLength({ min: 12 })
    .withMessage('La contraseña debe tener mínimo 12 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (!@#$%^&*)'),
  body('tipoDocumento')
    .isIn(Object.values(DocumentType))
    .withMessage(`Tipo de documento inválido. Valores: ${Object.values(DocumentType).join(', ')}`),
  body('identificacion').trim().notEmpty().withMessage('La identificación es requerida'),
  body('edad').optional().isInt({ min: 0, max: 120 }).withMessage('Edad inválida'),
];

export const registerDoctorValidator = [
  ...registerPatientValidator,
  body('tarjetaProfesional').trim().notEmpty().withMessage('La tarjeta profesional es requerida'),
  body('especialidad').trim().notEmpty().withMessage('La especialidad es requerida'),
  body('experienciaAnios')
    .isInt({ min: 0 })
    .withMessage('Los años de experiencia deben ser un número positivo'),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('La contraseña actual es requerida'),
  passwordRules,
];

export const recoverPasswordValidator = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  passwordRules,
];
