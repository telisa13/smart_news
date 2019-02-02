/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rss_urls', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    url: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    id_source: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'sources',
        key: 'id'
      }
    },
    id_category: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    // Timestamps
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
      // createdAt: Sequelize.DATE,
      //   updatedAt: Sequelize.DATE,
  }, {
    tableName: 'rss_urls'
  });
};
