exports.name = 'heroku_c2fe47fa4c1fa73';
exports.user = 'bb84133ff57204';
exports.password = 'd5d4f448';

exports.config = {
  host: 'eu-cdbr-west-02.cleardb.net',
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    useUTC: false // for reading from database
  },
  timezone: '+02:00' //for writing to database
};