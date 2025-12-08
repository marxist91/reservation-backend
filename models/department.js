"use strict";
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Department extends Model {
    static associate(models) {
      if (models.Reservation) {
        Department.hasMany(models.Reservation, {
          foreignKey: 'department_id',
          as: 'reservations'
        });
      }
    }
  }

  Department.init({
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    }
    ,
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    responsable_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Department',
    tableName: 'departments',
    underscored: true,
    timestamps: true
  });

  return Department;
};
