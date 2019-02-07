exports.name = 'heroku_677d2009f795112';
exports.user = 'b557c7a04d9a38';
exports.password = 'caecc11f';

exports.config = {
  host: 'eu-cdbr-west-02.cleardb.net',
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    useUTC: false // for reading from database
  },
  timezone: '+02:00' //for writing to database
};