import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { UserRole, DocumentType } from '../types';

interface UserAttributes {
  id: string;
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  tipoDocumento: DocumentType;
  identificacion: string;
  edad?: number;
  departamentoId?: number;
  ciudadId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public nombre!: string;
  public email!: string;
  public password!: string;
  public rol!: UserRole;
  public tipoDocumento!: DocumentType;
  public identificacion!: string;
  public edad?: number;
  public departamentoId?: number;
  public ciudadId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    rol: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
    },
    tipoDocumento: {
      type: DataTypes.ENUM(...Object.values(DocumentType)),
      allowNull: false,
    },
    identificacion: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    edad: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    departamentoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ciudadId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
