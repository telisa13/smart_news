/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('presidents', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    link: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    image: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
      // Timestamps
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
  }, {
    tableName: 'presidents'
  });
};
