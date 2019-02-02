/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tweets', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    text: {
      type: DataTypes.STRING(400),
      allowNull: false
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    lang: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    id_president: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'presidents',
        key: 'id'
      }
    },
    tweet_id: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    // Timestamps
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {
    tableName: 'tweets'
  });
};
