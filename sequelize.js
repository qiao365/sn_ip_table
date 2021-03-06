const Sequelize = require('sequelize');
const APP = "promoserver";
var sequelize = new Sequelize(APP, APP, `${APP}`, {
    host: "127.0.0.1",
    logging: false,
    define: {
        freezeTableName: true,
        underscored: true
    },
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 2000
    },
    dialect: 'postgres',
    timezone: '+08:00' //东八时区
});

exports.sequelize = sequelize;
exports.Sequelize = Sequelize;