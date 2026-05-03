import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
import { sendError } from '../utils/response';

export const checkRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'No autenticado', 401);
      return;
    }

    if (!roles.includes(req.user.rol)) {
      sendError(res, `Acceso denegado. Roles permitidos: ${roles.join(', ')}`, 403);
      return;
    }

    next();
  };
};
