exports.name = 'smart_news';
exports.user = 'root';
exports.password = 'mysql101';

exports.config = {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    useUTC: false // for reading from database
  },
  timezone: '+02:00' //for writing to database
};