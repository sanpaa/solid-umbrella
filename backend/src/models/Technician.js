const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Technician = sequelize.define('Technician', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  specialty: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['refrigeration', 'electrical', 'both']],
    },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  vehicle_plate: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
  },
  total_services: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'technicians',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Technician;
