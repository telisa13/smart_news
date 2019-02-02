/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('news', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    image: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    link: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_good: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    views: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    read: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '5'
    },
    likes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dislikes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_vip: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    id_category: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    id_source: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'sources',
        key: 'id'
      }
    },
    // Timestamps
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,

    views_feed: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'

    },
    views_user: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'

    },
    views_guest: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'

    },
    users: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    weight: {
      type: DataTypes.DOUBLE(11),
      allowNull: true
    },
  }, {
    tableName: 'news'
  });
};
