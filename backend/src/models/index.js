const { sequelize } = require('../config/database');

// Importar todos os models
const User = require('./User');
// Adicione outros models conforme criar:
// const Client = require('./Client');
// const ServiceOrder = require('./ServiceOrder');
// etc...

// Definir associações
// User.hasOne(Technician, { foreignKey: 'user_id' });
// Client.hasMany(ServiceOrder, { foreignKey: 'client_id' });
// etc...

module.exports = {
  sequelize,
  User,
  // Exporte outros models aqui
};
