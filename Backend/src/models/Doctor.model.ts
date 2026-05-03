import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User.model';

interface DoctorAttributes {
  id: string;
  userId: string;
  tarjetaProfesional: string;
  especialidad: string;
  experienciaAnios: number;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DoctorCreationAttributes extends Optional<DoctorAttributes, 'id' | 'activo'> {}

class Doctor extends Model<DoctorAttributes, DoctorCreationAttributes> implements DoctorAttributes {
  public id!: string;
  public userId!: string;
  public tarjetaProfesional!: string;
  public especialidad!: string;
  public experienciaAnios!: number;
  public activo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Doctor.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    tarjetaProfesional: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    especialidad: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    experienciaAnios: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'doctors',
    timestamps: true,
  }
);

// Asociaciones
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctor' });

export default Doctor;
