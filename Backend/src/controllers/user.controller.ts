import { Request, Response } from 'express';
import userService from '../services/user.service';
import authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';

export class UserController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getAll();
      sendSuccess(res, users);
    } catch (error) {
      sendError(res, (error as Error).message, 500);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.getById(req.params.id);
      sendSuccess(res, user);
    } catch (error) {
      sendError(res, (error as Error).message, 404);
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.getProfile(req.user!.sub);
      sendSuccess(res, user);
    } catch (error) {
      sendError(res, (error as Error).message, 404);
    }
  }

  async getDoctors(req: Request, res: Response): Promise<void> {
    try {
      const isAdmin = req.user?.rol === 'admin';
      const doctors = await userService.getDoctors(isAdmin);
      sendSuccess(res, doctors);
    } catch (error) {
      sendError(res, (error as Error).message, 500);
    }
  }

  async toggleDoctorStatus(req: Request, res: Response): Promise<void> {
    try {
      const { activo } = req.body;
      const doctor = await userService.toggleDoctorStatus(req.params.id, activo);
      sendSuccess(res, doctor, 200, `Médico ${doctor.activo ? 'activado' : 'desactivado'}`);
    } catch (error) {
      sendError(res, (error as Error).message, 404);
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.updateProfile(req.user!.sub, req.body);
      sendSuccess(res, user, 200, 'Perfil actualizado correctamente');
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.updateProfile(req.params.id, req.body);
      sendSuccess(res, user, 200, 'Usuario actualizado correctamente');
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async bulkCreateDoctors(req: Request, res: Response): Promise<void> {
    try {
      const doctors = req.body;
      if (!Array.isArray(doctors)) throw new Error('Se requiere un array de médicos');
      const results = await authService.registerDoctorsBulk(doctors);
      sendSuccess(res, results, 201, 'Proceso de creación masiva finalizado');
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async deleteUser(req: any, res: any) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      return sendSuccess(res, null, 200, 'Usuario eliminado correctamente');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }
}

export default new UserController();
