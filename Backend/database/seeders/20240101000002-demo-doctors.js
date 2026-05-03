'use strict';

const { v4: uuidv4 } = require('uuid');

// Mismos emails para consultar los IDs reales desde la BD
module.exports = {
  async up(queryInterface) {
    // Buscamos los usuarios médicos ya insertados
    const [doctors] = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE rol = 'medico'`
    );

    const doc1 = doctors.find(d => d.email === 'carlos.mendez@vitasalud.com');
    const doc2 = doctors.find(d => d.email === 'laura.gomez@vitasalud.com');

    await queryInterface.bulkInsert('doctors', [
      {
        id: uuidv4(),
        userId: doc1.id,
        tarjetaProfesional: 'TP-COL-001234',
        especialidad: 'Medicina General',
        experienciaAnios: 15,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        userId: doc2.id,
        tarjetaProfesional: 'TP-COL-005678',
        especialidad: 'Pediatría',
        experienciaAnios: 8,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('doctors', null, {});
  },
};
