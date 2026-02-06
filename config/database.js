require('dotenv').config({ path: '.env', override: false });

const env = process.env.NODE_ENV || 'development';

const base = {
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  dialect: 'mysql',
};

module.exports = {
  development: base,
  test: base,
  production: base,
  [env]: base,
};
