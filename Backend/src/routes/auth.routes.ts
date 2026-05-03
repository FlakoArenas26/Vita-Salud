import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { loginLimiter } from '../middlewares/rateLimiter.middleware';
import { validate } from '../middlewares/validate.middleware';
import { verifyToken } from '../middlewares/auth.middleware';
import {
  changePasswordValidator,
  loginValidator,
  recoverPasswordValidator,
  registerPatientValidator,
  registerDoctorValidator,
} from '../validators/auth.validator';

const router = Router();

// POST /api/auth/login
router.post('/login', loginLimiter, loginValidator, validate, authController.login.bind(authController));

// POST /api/auth/logout
router.post('/logout', verifyToken, authController.logout.bind(authController));

// POST /api/auth/register (paciente)
router.post('/register', registerPatientValidator, validate, authController.registerPatient.bind(authController));

// POST /api/auth/register/doctor (solo admin debería hacer esto, pero lo dejamos público para la demo)
router.post('/register/doctor', registerDoctorValidator, validate, authController.registerDoctor.bind(authController));

// POST /api/auth/refresh
router.post('/refresh', authController.refresh.bind(authController));

// POST /api/auth/change-password
router.post(
  '/change-password',
  verifyToken,
  changePasswordValidator,
  validate,
  authController.changePassword.bind(authController)
);

// POST /api/auth/recover-password
router.post(
  '/recover-password',
  recoverPasswordValidator,
  validate,
  authController.recoverPassword.bind(authController)
);

export default router;
