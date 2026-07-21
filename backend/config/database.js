'use strict';
const { Sequelize } = require('sequelize');

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');

module.exports = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
});
