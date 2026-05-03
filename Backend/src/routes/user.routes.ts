import { Router } from 'express';
import userController from '../controllers/user.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';
import { UserRole } from '../types';

const router = Router();

// GET /api/users/me - perfil del usuario autenticado
router.get('/me', verifyToken, userController.getProfile.bind(userController));

// PATCH /api/users/me - actualizar perfil del usuario autenticado
router.patch('/me', verifyToken, userController.updateProfile.bind(userController));

// GET /api/users/doctors - lista de médicos (todos los roles)
router.get('/doctors', verifyToken, userController.getDoctors.bind(userController));

// GET /api/users - solo admin
router.get('/', verifyToken, checkRole(UserRole.ADMIN), userController.getAll.bind(userController));

// GET /api/users/:id - solo admin
router.get('/:id', verifyToken, checkRole(UserRole.ADMIN), userController.getById.bind(userController));

// PATCH /api/users/:id - solo admin
router.patch('/:id', verifyToken, checkRole(UserRole.ADMIN), userController.updateUser.bind(userController));

// PATCH /api/users/doctors/:id/toggle - activar/desactivar médico (solo admin)
router.patch(
  '/doctors/:id/toggle',
  verifyToken,
  checkRole(UserRole.ADMIN),
  userController.toggleDoctorStatus.bind(userController)
);

// POST /api/users/bulk-doctors - creación masiva (solo admin)
router.post(
  '/bulk-doctors',
  verifyToken,
  checkRole(UserRole.ADMIN),
  userController.bulkCreateDoctors.bind(userController)
);

// DELETE /api/users/:id - solo admin
router.delete('/:id', verifyToken, checkRole(UserRole.ADMIN), userController.deleteUser.bind(userController));

export default router;
