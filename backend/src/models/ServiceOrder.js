const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ServiceOrder = sequelize.define('ServiceOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id',
    },
  },
  technician_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'technicians',
      key: 'id',
    },
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  address_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  service_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['refrigeration', 'electrical']],
    },
  },
  equipment: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  problem: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  solution: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'open',
    validate: {
      isIn: [['open', 'assigned', 'in_progress', 'waiting_part', 'completed', 'cancelled']],
    },
  },
  priority: {
    type: DataTypes.STRING(20),
    defaultValue: 'normal',
    validate: {
      isIn: [['low', 'normal', 'high', 'urgent']],
    },
  },
  scheduled_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  estimated_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  final_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'service_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = ServiceOrder;
