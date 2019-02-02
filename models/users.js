/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    summary_news_day: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '7'
    },
    summary_news_time: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: '19:00:00'
    },
    likes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    views: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    friends: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    is_dark_theme: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    share: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Timestamps
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {
    tableName: 'users'
  });
};
