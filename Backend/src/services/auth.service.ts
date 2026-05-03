import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, Doctor } from '../models';
import { DocumentType, LoginDto, RegisterUserDto, RegisterDoctorDto, UserRole } from '../types';

const SALT_ROUNDS = 12;

export class AuthService {
  async login(dto: LoginDto) {
    const user = await User.findOne({ where: { email: dto.email } });
    if (!user) throw new Error('Credenciales inválidas');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new Error('Credenciales inválidas');

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h', algorithm: 'HS256' }
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET || 'vitasalud_refresh_secret_key',
      { expiresIn: '7d', algorithm: 'HS256' }
    );

    const { password: _, ...userSafe } = user.toJSON();
    return { token: accessToken, refreshToken, user: userSafe };
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'vitasalud_refresh_secret_key') as any;
      const user = await User.findByPk(decoded.sub);
      if (!user) throw new Error('Usuario no encontrado');

      const accessToken = jwt.sign(
        { sub: user.id, email: user.email, rol: user.rol },
        process.env.JWT_SECRET as string,
        { expiresIn: '8h', algorithm: 'HS256' }
      );

      return { token: accessToken };
    } catch (error) {
      throw new Error('Refresh token inválido o expirado');
    }
  }

  async registerPatient(dto: RegisterUserDto) {
    const exists = await User.findOne({ where: { email: dto.email } });
    if (exists) throw new Error('El email ya está registrado');

    const hashed = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await User.create({
      ...dto,
      identificacion: dto.identificacion.replace(/\./g, ''),
      password: hashed,
      rol: UserRole.PACIENTE,
    });

    // AUTO-LOGIN: Generar tokens inmediatamente
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h', algorithm: 'HS256' }
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET || 'vitasalud_refresh_secret_key',
      { expiresIn: '7d', algorithm: 'HS256' }
    );

    const { password: _, ...userSafe } = user.toJSON();
    return { token: accessToken, refreshToken, user: userSafe };
  }

  async registerDoctor(dto: RegisterDoctorDto) {
    const exists = await User.findOne({ where: { email: dto.email } });
    if (exists) throw new Error('El email ya está registrado');

    const tpExists = await Doctor.findOne({ where: { tarjetaProfesional: dto.tarjetaProfesional } });
    if (tpExists) throw new Error('La tarjeta profesional ya está registrada');

    // Validación estricta de contraseña (mínimo 12 caracteres)
    if (!dto.password || dto.password.length < 12) {
      throw new Error(`La contraseña de ${dto.email} es demasiado corta (mínimo 12 caracteres)`);
    }

    const hashed = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await User.create({
      nombre: dto.nombre,
      email: dto.email,
      password: hashed,
      rol: UserRole.MEDICO,
      tipoDocumento: dto.tipoDocumento || DocumentType.CC,
      identificacion: String(dto.identificacion).replace(/\./g, ''),
      edad: dto.edad || 35,
      departamentoId: dto.departamentoId,
      ciudadId: dto.ciudadId,
    });

    const doctor = await Doctor.create({
      userId: user.id,
      tarjetaProfesional: dto.tarjetaProfesional,
      especialidad: dto.especialidad,
      experienciaAnios: dto.experienciaAnios || Math.floor(Math.random() * 23) + 2,
    });

    const { password: _, ...userSafe } = user.toJSON();
    return { ...userSafe, ...doctor.toJSON(), id: user.id, doctorId: doctor.id };
  }

  async registerDoctorsBulk(doctors: RegisterDoctorDto[]) {
    const results = [];
    for (const doc of doctors) {
      try {
        const result = await this.registerDoctor(doc);
        results.push({ email: doc.email, success: true, id: result.id });
      } catch (error) {
        results.push({ email: doc.email, success: false, error: (error as Error).message });
      }
    }
    return results;
  }
}

export default new AuthService();
