const dotenv = require('dotenv');
const path = require('path');
const { Sequelize } = require('sequelize');
dotenv.config({path: path.resolve(__dirname, `${process.env.NODE_ENV || 'development'}.env`)});
const toBool = (x) => (x && (x.toLowerCase() === 'true' || x.toLowerCase() === 'on')) || false;
const DATABASE_URL = process.env.DATABASE_URL === undefined ? "./database.db" : process.env.DATABASE_URL;

const CONFIG = {
    app: {
        session_name: process.env.SESSION_NAME || '',
        botname: process.env.BOTNAME || 'X-ASTRAL',
        version: require('./package.json').version,
        packname: process.env.PACKNAME || '❤️NaxorDev',
        env: process.env.NODE_ENV || 'development',
        prefix: process.env.COMMAND_PREFIX || '?',
        mode: toBool(process.env.MODE || "true"),
        mods: process.env.MODS || '27686881509,27686567257',
        me: process.env.ME || '27686881509,27686567257',
        sdb: DATABASE_URL === "./database.db" ? new Sequelize({ dialect: "sqlite", storage: DATABASE_URL, logging: false }) : new Sequelize(DATABASE_URL, {dialect: "postgres", ssl: true, protocol: "postgres", dialectOptions: { native: true, ssl: { require: true, rejectUnauthorized: false },}, logging: false }),
    },
};

module.exports = CONFIG;
