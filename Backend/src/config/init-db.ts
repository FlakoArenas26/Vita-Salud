import mysql from 'mysql2/promise';
import sequelize from './database';
import User from '../models/User.model';
import Doctor from '../models/Doctor.model';
import { UserRole, DocumentType } from '../types';
import bcrypt from 'bcrypt';

export async function initializeDatabase() {
  const dbName = process.env.DB_NAME || 'vitasalud';

  // 1. Crear base de datos si no existe
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();
    console.log(`✅ Base de datos '${dbName}' verificada/creada`);
  } catch (error) {
    console.error('❌ Error al crear la base de datos:', error);
    throw error;
  }

  // 2. Sincronizar modelos
  try {
    // Sincronización normal para no borrar datos existentes
    await sequelize.sync({ alter: true });

    console.log('✅ Modelos sincronizados con la base de datos');
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error);
    throw error;
  }

  // 3. Sembrar datos iniciales (Seed) de forma granular
  await seedInitialData();
}

async function seedInitialData() {
  try {
    const SALT_ROUNDS = 12;

    // 1. Verificar/Crear Admin
    const adminExists = await User.findOne({ where: { rol: UserRole.ADMIN } });
    if (!adminExists) {
      const adminEmail = 'admin@vitasalud.com';
      const hashedAdminPassword = await bcrypt.hash('Admin123456*!', SALT_ROUNDS);
      
      await User.create({
        nombre: 'Administrador Principal',
        email: adminEmail,
        password: hashedAdminPassword,

        rol: UserRole.ADMIN,
        tipoDocumento: DocumentType.CC,
        identificacion: '123456789',
        departamentoId: 2,
        ciudadId: 12,
      });
      console.log('👤 Usuario Admin creado exitosamente');
    }

    // 2. Verificar/Crear Médicos Iniciales (Solo los 2 originales)
    const baseDoctors = [
      { 
        nombre: 'Dr. Carlos García', 
        email: 'carlos.garcia@vitasalud.com', 
        especialidad: 'Medicina General', 
        tp: 'TP-54321',
        identificacion: '1098765',
        dep: 5,
        city: 167
      },
      { 
        nombre: 'Dra. María Martínez', 
        email: 'maria.martinez@vitasalud.com', 
        especialidad: 'Pediatría', 
        tp: 'TP-12345',
        identificacion: '1234567',
        dep: 26,
        city: 897
      }
    ];

    console.log('🩺 Verificando médicos iniciales...');
    
    for (const docInfo of baseDoctors) {
      // Verificar si el usuario ya existe para evitar ER_DUP_ENTRY
      let user = await User.findOne({ where: { email: docInfo.email } });
      
      if (!user) {
        const hashedDocPassword = await bcrypt.hash('Medico123456*!', SALT_ROUNDS);
        user = await User.create({
          nombre: docInfo.nombre,
          email: docInfo.email,
          password: hashedDocPassword,
          rol: UserRole.MEDICO,
          tipoDocumento: DocumentType.CC,
          identificacion: docInfo.identificacion,
          departamentoId: docInfo.dep,
          ciudadId: docInfo.city,
        });
      }

      // Verificar si el registro de doctor ya existe para este usuario
      const existingDoc = await Doctor.findOne({ where: { userId: user.id } });
      if (!existingDoc) {
        await Doctor.create({
          userId: user.id,
          tarjetaProfesional: docInfo.tp,
          especialidad: docInfo.especialidad,
          experienciaAnios: 10,
          activo: true
        });
      }
    }
    console.log('✅ Semilla de médicos (2) sincronizada correctamente');
    
  } catch (error) {
    console.error('❌ Error crítico al sembrar datos:', error);
  }
}
