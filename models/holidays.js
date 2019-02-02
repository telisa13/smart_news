/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('holidays', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    holidays: {
      type: DataTypes.TEXT,
      allowNull: true
    },
      // Timestamps
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
  }, {
    tableName: 'holidays'
  });
};
