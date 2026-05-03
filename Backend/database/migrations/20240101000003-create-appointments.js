'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      pacienteId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      doctorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'doctors', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      consultorio: { type: Sequelize.STRING(50), allowNull: false },
      especialidad: { type: Sequelize.STRING(100), allowNull: false },
      fecha: { type: Sequelize.DATEONLY, allowNull: false },
      hora: { type: Sequelize.STRING(10), allowNull: false },
      estado: {
        type: Sequelize.ENUM('agendada', 'atendida', 'cancelada'),
        defaultValue: 'agendada',
      },
      recomendaciones: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('appointments');
  },
};
