/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('news_tags', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    id_news: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'news',
        key: 'id'
      }
    },
    id_tag: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tags',
        key: 'id'
      }
    },
    // Timestamps
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {
    tableName: 'news_tags'
  });
};
