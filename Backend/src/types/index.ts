export enum UserRole {
  ADMIN = 'admin',
  MEDICO = 'medico',
  PACIENTE = 'paciente',
}

export enum AppointmentStatus {
  AGENDADA = 'agendada',
  ATENDIDA = 'atendida',
  CANCELADA = 'cancelada',
}

export enum DocumentType {
  CC = 'CC',
  TI = 'TI',
  CE = 'CE',
  PA = 'PA',
  RC = 'RC',
}

// Extiende el Request de Express para incluir el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export interface JwtPayload {
  sub: string;
  email: string;
  rol: UserRole;
  iat?: number;
  exp?: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface RecoverPasswordDto {
  email: string;
  newPassword: string;
}

export interface RegisterUserDto {
  nombre: string;
  email: string;
  password: string;
  tipoDocumento: DocumentType;
  identificacion: string;
  edad?: number;
  departamentoId?: number;
  ciudadId?: number;
}

export interface RegisterDoctorDto extends RegisterUserDto {
  tarjetaProfesional: string;
  especialidad: string;
  experienciaAnios: number;
}

export interface CreateAppointmentDto {
  doctorId: string;
  fecha: string;
  hora: string;
  consultorio: string;
}

export interface UpdateAppointmentDto {
  estado: AppointmentStatus;
  recomendaciones?: string;
}

export interface RescheduleAppointmentDto {
  fecha: string;
  hora: string;
}
