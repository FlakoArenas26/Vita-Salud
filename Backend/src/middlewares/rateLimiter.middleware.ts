import rateLimit from 'express-rate-limit';

// Limita el endpoint de login a 5 intentos cada 15 minutos
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // no cuenta intentos exitosos
});

// Limiter general para la API
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100,
  message: {
    success: false,
    message: 'Demasiadas peticiones. Intenta más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
