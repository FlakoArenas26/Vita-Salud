'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const [patients] = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE rol = 'paciente'`
    );
    const [doctors] = await queryInterface.sequelize.query(
      `SELECT d.id, u.email FROM doctors d JOIN users u ON d.userId = u.id`
    );

    const pac1 = patients.find(p => p.email === 'juan.perez@email.com');
    const pac2 = patients.find(p => p.email === 'maria.lopez@email.com');
    const doc1 = doctors.find(d => d.email === 'carlos.mendez@vitasalud.com');
    const doc2 = doctors.find(d => d.email === 'laura.gomez@vitasalud.com');

    await queryInterface.bulkInsert('appointments', [
      {
        id: uuidv4(),
        pacienteId: pac1.id,
        doctorId: doc1.id,
        consultorio: 'Consultorio 101',
        especialidad: 'Medicina General',
        fecha: '2025-02-10',
        hora: '09:00 AM',
        estado: 'agendada',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        pacienteId: pac2.id,
        doctorId: doc2.id,
        consultorio: 'Consultorio 205',
        especialidad: 'Pediatría',
        fecha: '2025-02-11',
        hora: '10:30 AM',
        estado: 'atendida',
        recomendaciones: 'Reposo por 3 días, hidratación constante.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        pacienteId: pac1.id,
        doctorId: doc2.id,
        consultorio: 'Consultorio 205',
        especialidad: 'Pediatría',
        fecha: '2025-02-15',
        hora: '02:00 PM',
        estado: 'cancelada',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('appointments', null, {});
  },
};
