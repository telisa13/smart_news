/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('site', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    usd: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    temp: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    // Timestamps
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {
    tableName: 'site'
  });
};
