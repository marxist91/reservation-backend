module.exports = (sequelize, DataTypes) => {
  return sequelize.define("ActionLog", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    acteur_id: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.STRING }, // ex: "UPDATE_STATUT", "DELETE_RESERVATION"
    cible_type: { type: DataTypes.STRING }, // ex: "Reservation"
    cible_id: { type: DataTypes.INTEGER },
    avant: { type: DataTypes.JSONB },
    apres: { type: DataTypes.JSONB },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  });
};