/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sources', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    link: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    // Timestamps
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {
    tableName: 'sources'
  });
};
