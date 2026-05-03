'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const adminId    = uuidv4();
const doctor1Id  = uuidv4();
const doctor2Id  = uuidv4();
const paciente1Id = uuidv4();
const paciente2Id = uuidv4();

// Exportamos los IDs para usarlos en los demás seeders
module.exports._ids = { adminId, doctor1Id, doctor2Id, paciente1Id, paciente2Id };

module.exports = {
  async up(queryInterface) {
    const password = await bcrypt.hash('Admin1234', 12);
    const passDoc  = await bcrypt.hash('Doctor1234', 12);
    const passPac  = await bcrypt.hash('Paciente1234', 12);

    await queryInterface.bulkInsert('users', [
      {
        id: adminId,
        nombre: 'Administrador Sistema',
        email: 'admin@vitasalud.com',
        password,
        rol: 'admin',
        tipoDocumento: 'CC',
        identificacion: '1000000001',
        edad: 35,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: doctor1Id,
        nombre: 'Dr. Carlos Méndez',
        email: 'carlos.mendez@vitasalud.com',
        password: passDoc,
        rol: 'medico',
        tipoDocumento: 'CC',
        identificacion: '1000000002',
        edad: 45,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: doctor2Id,
        nombre: 'Dra. Laura Gómez',
        email: 'laura.gomez@vitasalud.com',
        password: passDoc,
        rol: 'medico',
        tipoDocumento: 'CC',
        identificacion: '1000000003',
        edad: 38,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: paciente1Id,
        nombre: 'Juan Pérez',
        email: 'juan.perez@email.com',
        password: passPac,
        rol: 'paciente',
        tipoDocumento: 'CC',
        identificacion: '1000000004',
        edad: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: paciente2Id,
        nombre: 'María López',
        email: 'maria.lopez@email.com',
        password: passPac,
        rol: 'paciente',
        tipoDocumento: 'CC',
        identificacion: '1000000005',
        edad: 25,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
