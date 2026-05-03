import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';
import { sendError } from '../utils/response';
import tokenBlacklistService from '../services/tokenBlacklist.service';

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'Token de autorización requerido', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  // Verificar si el token está en la blacklist (logout)
  if (tokenBlacklistService.isBlacklisted(token)) {
    sendError(res, 'Token inválido o revocado (sesión cerrada)', 401);
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = payload;
    // Guardar el token en la request para usarlo en logout
    (req as any).token = token;
    // Guardar el exp time para la blacklist
    (req as any).tokenExp = payload.exp;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, 'El token ha expirado', 401);
      return;
    }
    sendError(res, 'Token inválido', 401);
  }
};
