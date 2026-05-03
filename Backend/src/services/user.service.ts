import { User, Doctor } from '../models';
import { UserRole } from '../types';

export class UserService {
  async getAll() {
    return User.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: Doctor, as: 'doctor', required: false }],
    });
  }

  async getById(id: string) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Doctor, as: 'doctor', required: false }],
    });
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  }

  async getProfile(id: string) {
    return this.getById(id);
  }

  /**
   * Obtiene la lista de médicos.
   * @param all Si es true, retorna todos (incluyendo inactivos). Si es false, solo activos.
   */
  async getDoctors(all: boolean = false) {
    const users = await User.findAll({
      where: { rol: UserRole.MEDICO },
      attributes: { exclude: ['password'] },
      include: [{ 
        model: Doctor, 
        as: 'doctor', 
        required: false,
        ...(all ? {} : { where: { activo: true } })
      }],
    });

    // Aplanar la respuesta para el frontend
    return users.map(user => {
      const u = user.toJSON() as any;
      const doctorData = u.doctor || {};
      return {
        ...u,
        ...doctorData,
        id: u.id, // Mantener el ID del usuario como principal
        doctorId: doctorData.id,
        doctor: undefined // Quitar el anidado para evitar confusión
      };
    });
  }

  async toggleDoctorStatus(id: string, activo?: boolean) {
    // Intentar buscar por ID de doctor o por ID de usuario
    let doctor = await Doctor.findByPk(id);
    if (!doctor) {
      doctor = await Doctor.findOne({ where: { userId: id } });
    }

    if (!doctor) throw new Error('Médico no encontrado');
    
    doctor.activo = activo !== undefined ? activo : !doctor.activo;
    await doctor.save();
    return doctor;
  }

  async updateProfile(id: string, data: any) {
    const user = await User.findByPk(id);
    if (!user) throw new Error('Usuario no encontrado');

    const { 
      nombre, email, tipoDocumento, identificacion, departamentoId, ciudadId, edad, 
      especialidad, tarjetaProfesional, experienciaAnios 
    } = data;

    if (nombre) user.nombre = nombre;
    if (email) user.email = email;
    if (tipoDocumento) user.tipoDocumento = tipoDocumento;
    if (identificacion) user.identificacion = identificacion.replace(/\./g, '');
    if (departamentoId) user.departamentoId = departamentoId;
    if (ciudadId) user.ciudadId = ciudadId;
    if (edad) user.edad = edad;

    await user.save();

    if (user.rol === UserRole.MEDICO) {
      let doctor = await Doctor.findOne({ where: { userId: id } });
      if (doctor) {
        if (especialidad) doctor.especialidad = especialidad;
        if (tarjetaProfesional) doctor.tarjetaProfesional = tarjetaProfesional;
        if (experienciaAnios !== undefined) doctor.experienciaAnios = experienciaAnios;
        await doctor.save();
      }
    }

    return this.getProfile(id);
  }
  async deleteUser(id: string) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Si es médico, eliminar también el registro de la tabla Doctor
    if (user.rol === UserRole.MEDICO) {
      await Doctor.destroy({ where: { userId: id } });
    }

    await user.destroy();
    return true;
  }
}

export default new UserService();
