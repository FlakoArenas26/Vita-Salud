import { Appointment, Doctor, User } from '../models';
import { CreateAppointmentDto, UpdateAppointmentDto, RescheduleAppointmentDto, AppointmentStatus, UserRole } from '../types';

export class AppointmentService {
  private readonly WORKING_HOURS = new Set([
    '07:00',
    '07:30',
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
  ]);

  /**
   * Helper para buscar un médico por su ID propio (tabla Doctor) o por su ID de usuario (tabla User).
   * @param id ID a buscar.
   * @returns Instancia del doctor o null.
   */
  private async getDoctorByInputId(id: string) {
    let doctor = await Doctor.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['nombre'] }],
    });
    if (!doctor) {
      doctor = await Doctor.findOne({
        where: { userId: id },
        include: [{ model: User, as: 'user', attributes: ['nombre'] }],
      });
    }
    return doctor;
  }

  /**
   * Obtiene la fecha y hora actuales en la zona horaria operativa de Colombia.
   * Se utiliza como validación de integridad del backend para que la API respete
   * las mismas reglas de agenda que observa el frontend.
   */
  private getCurrentColombiaContext() {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = Object.fromEntries(
      formatter.formatToParts(new Date()).map((part) => [part.type, part.value])
    ) as Record<string, string>;

    return {
      today: `${parts.year}-${parts.month}-${parts.day}`,
      currentMinutes: Number(parts.hour) * 60 + Number(parts.minute),
    };
  }

  private getColombiaWeekday(fecha: string) {
    const referenceDate = new Date(`${fecha}T12:00:00-05:00`);
    const weekdayName = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Bogota',
      weekday: 'long',
    }).format(referenceDate);

    const mapping: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    return mapping[weekdayName.toLowerCase()] ?? referenceDate.getUTCDay();
  }

  /**
   * Valida que la fecha y la hora solicitadas pertenezcan al calendario hábil
   * de la aplicación: lunes a sábado, en bloques autorizados, con al menos una
   * hora de anticipación para solicitudes del mismo día.
   *
   * @param {string} fecha Fecha objetivo en formato YYYY-MM-DD.
   * @param {string} hora Hora objetivo en formato HH:MM.
   * @throws {Error} Si la cita queda fuera de la política operativa.
   */
  private validateOperationalSchedule(fecha: string, hora: string) {
    const selectedDate = new Date(`${fecha}T12:00:00-05:00`);
    const weekDay = this.getColombiaWeekday(fecha);

    if (Number.isNaN(selectedDate.getTime())) {
      throw new Error('La fecha de la cita es inválida');
    }

    if (weekDay === 0) {
      throw new Error('Solo se permiten citas de lunes a sábado');
    }

    if (!this.WORKING_HOURS.has(hora)) {
      throw new Error('La hora seleccionada está fuera de los bloques habilitados por la app');
    }

    const { today, currentMinutes } = this.getCurrentColombiaContext();

    if (fecha < today) {
      throw new Error('No se pueden agendar ni reprogramar citas en fechas anteriores');
    }

    if (fecha === today) {
      if (currentMinutes < 7 * 60 || currentMinutes > 16 * 60) {
        throw new Error('Las citas del mismo día solo pueden solicitarse entre las 07:00 y las 17:00');
      }

      const appointmentMinutes = Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));
      if (appointmentMinutes <= currentMinutes + 60) {
        throw new Error('Las citas del mismo día requieren al menos 1 hora de anticipación');
      }
    }
  }

  /**
   * Crea una cita nueva para un paciente validando que el médico exista,
   * esté activo y no tenga un conflicto horario.
   *
   * @param {string} pacienteId Identificador del paciente autenticado.
   * @param {CreateAppointmentDto} dto Datos de la cita a registrar.
   * @returns {Promise<Appointment>} La cita recién creada.
   * @throws {Error} Si el médico no existe, está inactivo o ya tiene ocupada la franja.
   */
  async create(pacienteId: string, dto: CreateAppointmentDto) {
    const doctor = await this.getDoctorByInputId(dto.doctorId);
    if (!doctor) throw new Error('Médico no encontrado');
    if (!doctor.activo) throw new Error('El médico no está disponible actualmente');
    this.validateOperationalSchedule(dto.fecha, dto.hora);

    // Verificar que no exista ya una cita en ese horario para ese médico
    const conflict = await Appointment.findOne({
      where: {
        doctorId: doctor.id, // Se usa el ID real del doctor
        fecha: dto.fecha,
        hora: dto.hora,
        estado: AppointmentStatus.AGENDADA,
      },
    });
    if (conflict) throw new Error('El médico ya tiene una cita en ese horario');

    return Appointment.create({
      pacienteId,
      doctorId: doctor.id, // Se usa el ID real del doctor
      consultorio: dto.consultorio,
      especialidad: doctor.especialidad,
      fecha: dto.fecha,
      hora: dto.hora,
    });
  }

  /**
   * Obtiene la disponibilidad de un médico para una fecha específica.
   * Consulta las citas agendadas y devuelve un arreglo con las horas ocupadas.
   *
   * @param {string} doctorId - El ID del médico a consultar.
   * @param {string} fecha - La fecha a consultar en formato YYYY-MM-DD.
   * @returns {Promise<string[]>} Una promesa que resuelve con un arreglo de las horas ocupadas (ej. ["08:00", "09:30"]).
   */
  async getDoctorAvailability(doctorIdOrUserId: string, fecha: string) {
    const doctor = await this.getDoctorByInputId(doctorIdOrUserId);
    if (!doctor) return []; // Si no existe, devolvemos array vacío

    const appointments = await Appointment.findAll({
      where: {
        doctorId: doctor.id, // Se usa el ID real del doctor
        fecha,
        estado: AppointmentStatus.AGENDADA,
      },
      attributes: ['hora'],
    });
    return appointments.map((appt) => appt.hora);
  }

  /**
   * Obtiene las citas visibles para el usuario autenticado según su rol.
   *
   * @param {string} requesterId ID del usuario que hace la consulta.
   * @param {UserRole} requesterRol Rol del usuario autenticado.
   * @returns {Promise<Appointment[]>} Listado de citas accesibles para el usuario.
   */
  async getAll(requesterId: string, requesterRol: UserRole) {
    const whereClause =
      requesterRol === UserRole.PACIENTE
        ? { pacienteId: requesterId }
        : requesterRol === UserRole.MEDICO
          ? {}  // se filtra por doctorId abajo
          : {}; // admin ve todo

    const include = [
      {
        model: User,
        as: 'paciente',
        attributes: ['id', 'nombre', 'email', 'identificacion'],
      },
      {
        model: Doctor,
        as: 'doctor',
        include: [{ model: User, as: 'user', attributes: ['id', 'nombre', 'email'] }],
      },
    ];

    if (requesterRol === UserRole.MEDICO) {
      const doctor = await Doctor.findOne({ where: { userId: requesterId } });
      if (!doctor) throw new Error('Perfil de médico no encontrado');
      return Appointment.findAll({
        where: { doctorId: doctor.id },
        include,
        order: [['fecha', 'ASC'], ['hora', 'ASC']],
      });
    }

    return Appointment.findAll({ where: whereClause, include, order: [['fecha', 'ASC']] });
  }

  /**
   * Busca una cita puntual y valida que el solicitante tenga acceso a verla.
   *
   * @param {string} id ID de la cita.
   * @param {string} requesterId ID del usuario autenticado.
   * @param {UserRole} requesterRol Rol del usuario autenticado.
   * @returns {Promise<Appointment>} La cita encontrada con sus relaciones.
   * @throws {Error} Si la cita no existe o el usuario no tiene permiso.
   */
  async getById(id: string, requesterId: string, requesterRol: UserRole) {
    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: User, as: 'paciente', attributes: { exclude: ['password'] } },
        {
          model: Doctor,
          as: 'doctor',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }],
        },
      ],
    });

    if (!appointment) throw new Error('Cita no encontrada');

    // Paciente solo ve sus propias citas
    if (requesterRol === UserRole.PACIENTE && appointment.pacienteId !== requesterId) {
      throw new Error('No tienes permiso para ver esta cita');
    }

    return appointment;
  }

  /**
   * Actualiza el estado de una cita respetando las reglas por rol.
   *
   * @param {string} id ID de la cita a modificar.
   * @param {UpdateAppointmentDto} dto Nuevo estado y recomendaciones opcionales.
   * @param {string} requesterId ID del usuario autenticado.
   * @param {UserRole} requesterRol Rol del usuario autenticado.
   * @returns {Promise<Appointment>} La cita actualizada.
   * @throws {Error} Si la cita no existe, ya fue atendida o el rol no tiene permisos.
   */
  async updateStatus(id: string, dto: UpdateAppointmentDto, requesterId: string, requesterRol: UserRole) {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) throw new Error('Cita no encontrada');

    if (appointment.estado === AppointmentStatus.ATENDIDA) {
      throw new Error('No se puede modificar una cita ya atendida');
    }

    // Paciente solo puede cancelar sus propias citas
    if (requesterRol === UserRole.PACIENTE) {
      if (appointment.pacienteId !== requesterId) throw new Error('Sin permiso');
      if (dto.estado !== AppointmentStatus.CANCELADA) throw new Error('El paciente solo puede cancelar citas');
    }

    // Médico solo puede actualizar sus propias citas
    if (requesterRol === UserRole.MEDICO) {
      const doctor = await Doctor.findOne({ where: { userId: requesterId } });
      if (!doctor || appointment.doctorId !== doctor.id) throw new Error('Sin permiso');
    }

    await appointment.update(dto);
    return appointment.reload();
  }

  /**
   * Atajo para cancelar una cita desde el flujo del paciente.
   *
   * @param {string} id ID de la cita.
   * @param {string} requesterId ID del paciente autenticado.
   * @returns {Promise<Appointment>} La cita cancelada.
   */
  async cancel(id: string, requesterId: string) {
    return this.updateStatus(
      id,
      { estado: AppointmentStatus.CANCELADA },
      requesterId,
      UserRole.PACIENTE
    );
  }

  /**
   * Reprograma una cita agendada validando propiedad de la cita y conflictos
   * del médico en la nueva franja.
   *
   * @param {string} id ID de la cita a reprogramar.
   * @param {RescheduleAppointmentDto} dto Nueva fecha y hora.
   * @param {string} requesterId ID del usuario autenticado.
   * @param {UserRole} requesterRol Rol del usuario autenticado.
   * @returns {Promise<Appointment>} La cita con la nueva fecha/hora.
   * @throws {Error} Si la cita no existe, no está agendada, no pertenece al usuario o hay conflicto.
   */
  async reschedule(id: string, dto: RescheduleAppointmentDto, requesterId: string, requesterRol: UserRole) {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) throw new Error('Cita no encontrada');

    if (appointment.estado !== AppointmentStatus.AGENDADA) {
      throw new Error('Solo se pueden reprogramar citas agendadas');
    }

    if (requesterRol === UserRole.PACIENTE && appointment.pacienteId !== requesterId) {
      throw new Error('Sin permiso para reprogramar esta cita');
    }

    this.validateOperationalSchedule(dto.fecha, dto.hora);

    // Verificar conflictos con la nueva fecha y hora
    const conflict = await Appointment.findOne({
      where: {
        doctorId: appointment.doctorId,
        fecha: dto.fecha,
        hora: dto.hora,
        estado: AppointmentStatus.AGENDADA,
      },
    });

    if (conflict && conflict.id !== appointment.id) {
      throw new Error('El médico ya tiene una cita en ese horario');
    }

    await appointment.update({
      fecha: dto.fecha,
      hora: dto.hora,
    });
    return appointment.reload();
  }
}

export default new AppointmentService();
