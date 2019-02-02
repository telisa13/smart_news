/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('queries', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    id_user: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    text: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
      // Timestamps
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
  }, {
    tableName: 'queries'
  });
};
