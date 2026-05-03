import { Request, Response } from 'express';
import authService from '../services/auth.service';
import tokenBlacklistService from '../services/tokenBlacklist.service';
import { sendSuccess, sendError } from '../utils/response';
import { LoginDto, RegisterUserDto, RegisterDoctorDto } from '../types';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body as LoginDto);
      sendSuccess(res, result, 200, 'Login exitoso');
    } catch (error) {
      sendError(res, (error as Error).message, 401);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = (req as any).token;
      const tokenExp = (req as any).tokenExp;

      if (token && tokenExp) {
        // Agregar el token a la blacklist con su tiempo de expiración
        tokenBlacklistService.addToBlacklist(token, tokenExp);
      }

      sendSuccess(res, null, 200, 'Sesión cerrada exitosamente. Token revocado.');
    } catch (error) {
      sendError(res, (error as Error).message, 500);
    }
  }

  async registerPatient(req: Request, res: Response): Promise<void> {
    try {
      const user = await authService.registerPatient(req.body as RegisterUserDto);
      sendSuccess(res, user, 201, 'Paciente registrado exitosamente');
    } catch (error) {
      const msg = (error as Error).message;
      sendError(res, msg, msg.includes('registrado') ? 409 : 400);
    }
  }

  async registerDoctor(req: Request, res: Response): Promise<void> {
    try {
      const doctor = await authService.registerDoctor(req.body as RegisterDoctorDto);
      sendSuccess(res, doctor, 201, 'Médico registrado exitosamente');
    } catch (error) {
      const msg = (error as Error).message;
      sendError(res, msg, msg.includes('registrad') ? 409 : 400);
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new Error('Refresh token es requerido');
      const result = await authService.refreshToken(refreshToken);
      sendSuccess(res, result, 200, 'Token renovado exitosamente');
    } catch (error) {
      sendError(res, (error as Error).message, 401);
    }
  }
}

export default new AuthController();
