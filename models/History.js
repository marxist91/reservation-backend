'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class History extends Model {
    static associate(models) {
      History.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'utilisateur'
      });
      History.belongsTo(models.Reservation, {
        foreignKey: 'reservation_id',
        as: 'reservation'
      });
    }
  }

  History.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true
    },
    reservation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'reservations',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'History',
    tableName: 'historique',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return History;
};
