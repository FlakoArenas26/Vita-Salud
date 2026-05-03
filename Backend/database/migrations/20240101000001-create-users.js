'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      nombre: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      password: { type: Sequelize.STRING(255), allowNull: false },
      rol: {
        type: Sequelize.ENUM('admin', 'medico', 'paciente'),
        allowNull: false,
      },
      tipoDocumento: {
        type: Sequelize.ENUM('CC', 'TI', 'CE', 'PA', 'RC'),
        allowNull: false,
      },
      identificacion: { type: Sequelize.STRING(30), allowNull: false },
      edad: { type: Sequelize.INTEGER, allowNull: true },
      departamentoId: { type: Sequelize.INTEGER, allowNull: true },
      ciudadId: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
