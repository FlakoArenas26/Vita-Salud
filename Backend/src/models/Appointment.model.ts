import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { AppointmentStatus } from '../types';
import User from './User.model';
import Doctor from './Doctor.model';

interface AppointmentAttributes {
  id: string;
  pacienteId: string;
  doctorId: string;
  consultorio: string;
  especialidad: string;
  fecha: string;
  hora: string;
  estado: AppointmentStatus;
  recomendaciones?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AppointmentCreationAttributes
  extends Optional<AppointmentAttributes, 'id' | 'estado' | 'recomendaciones'> {}

class Appointment
  extends Model<AppointmentAttributes, AppointmentCreationAttributes>
  implements AppointmentAttributes
{
  public id!: string;
  public pacienteId!: string;
  public doctorId!: string;
  public consultorio!: string;
  public especialidad!: string;
  public fecha!: string;
  public hora!: string;
  public estado!: AppointmentStatus;
  public recomendaciones?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Appointment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    pacienteId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'doctors', key: 'id' },
    },
    consultorio: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    especialidad: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    hora: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM(...Object.values(AppointmentStatus)),
      defaultValue: AppointmentStatus.AGENDADA,
    },
    recomendaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'appointments',
    timestamps: true,
  }
);

// Asociaciones
Appointment.belongsTo(User, { foreignKey: 'pacienteId', as: 'paciente' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
User.hasMany(Appointment, { foreignKey: 'pacienteId', as: 'appointments' });
Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments' });

export default Appointment;
