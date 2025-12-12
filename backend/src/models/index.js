const { sequelize } = require('../config/database');

// Importar todos os models
const User = require('./User');
const Client = require('./Client');
const Technician = require('./Technician');
const ServiceOrder = require('./ServiceOrder');
const Quote = require('./Quote');

// Definir associações
User.hasOne(Technician, { foreignKey: 'user_id', as: 'technician' });
Technician.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Client.hasMany(ServiceOrder, { foreignKey: 'client_id', as: 'orders' });
ServiceOrder.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

Client.hasMany(Quote, { foreignKey: 'client_id', as: 'quotes' });
Quote.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

Technician.hasMany(ServiceOrder, { foreignKey: 'technician_id', as: 'orders' });
ServiceOrder.belongsTo(Technician, { foreignKey: 'technician_id', as: 'technician' });

User.hasMany(ServiceOrder, { foreignKey: 'created_by', as: 'created_orders' });
ServiceOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(Quote, { foreignKey: 'created_by', as: 'created_quotes' });
Quote.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Quote.belongsTo(ServiceOrder, { foreignKey: 'order_id', as: 'order' });
ServiceOrder.hasMany(Quote, { foreignKey: 'order_id', as: 'quotes' });

module.exports = {
  sequelize,
  User,
  Client,
  Technician,
  ServiceOrder,
  Quote,
};
