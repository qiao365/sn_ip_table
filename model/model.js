var model = module.exports;
const sequelize = require('../sequelize').sequelize;
const Sequelize = require('../sequelize').Sequelize
const moment = require('moment');

const createdAt = {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: "created_at",
    get() {
        return getDate.call(this, 'createdAt');
    }
}

const updatedAt = {
    type: Sequelize.DATE,
    field: "updated_at",
    get() {
        return getDate.call(this, 'updatedAt');
    }
}

function getDate(field, tz) {
    tz = tz === undefined ? 8 : tz;
    let value = this.getDataValue(field);
    if(value == null) {
        return '';
    }
    return moment(this.getDataValue(field)).utcOffset(tz).format('YYYY-MM-DD HH:mm:ss');
}

model.DomainAccountBoxConnect = sequelize.define("t_box_account", {
    account: {
        type: Sequelize.STRING
    },
    boxSN: {
        type: Sequelize.STRING
    },
    boxName:{
        type: Sequelize.STRING,
        field: "box_name",
    },
    isBinding: {//绑定 解绑
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    createdAt: createdAt,
    updatedAt: updatedAt
});

model.DomainCoinEveryDay = sequelize.define("t_coin_everyday", {
    account: {
        type: Sequelize.STRING
    },
    boxSN: {
        type: Sequelize.STRING
    },
    boxIp: {//今日ip
        type: Sequelize.STRING
    },
    miningCoin:{//挖币总数
        type: Sequelize.DOUBLE,
        field: "mining_coin"
    },
    today:{
        type: Sequelize.STRING,
        field: "date_today"//2018-10-01
    },
    createdAt: createdAt,
    updatedAt: updatedAt
});

model.DomainBoxSum = sequelize.define("t_box_sum", {//盒子通讯表
    boxSN: {
        type: Sequelize.STRING,
        unique: true
    },
    boxIp: {
        type: Sequelize.STRING
    },
    bandwidth: {
        type: Sequelize.DOUBLE,
        defaultValue: 0
    },
    diskUsage: {
        type: Sequelize.DOUBLE,
        defaultValue: 0
    },
    diskTotal: {
        type: Sequelize.DOUBLE,
        defaultValue: 0
    },
    bt: {
        type: Sequelize.DOUBLE,
        defaultValue: 0
    },
    st: {
        type: Sequelize.DOUBLE,
        defaultValue: 0
    },
    activeTime: {
        type: Sequelize.DOUBLE,
        defaultValue: 0
    },
    createdAt: createdAt,
    updatedAt: updatedAt,
    updateTime:{
        type: Sequelize.DATE,
        field: "updated_time",
        defaultValue:Sequelize.NOW
    },
    version: {
        type: Sequelize.STRING,
        field: "version",
    },
    versionCode: {
        type: Sequelize.STRING,
        field: "version_code",
    },
    status: {//状态：0:未连接  1:挖矿中  2:待机中 3:异常
        type: Sequelize.INTEGER,
        defaultValue: 0,
        get() {
            let updatedAt = this.getDataValue('updatedAt');
            let status = this.getDataValue('status');
            if(updatedAt == null){
                return 0;
            }
            var m1 = new Date(moment(updatedAt).format("YYYY-MM-DD HH:mm:ss"));
            var m2 = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
            if((m2.getTime() - m1.getTime()) < 15*60*1000){//小于3分，则在线
                if(status != null && status != 0){
                    return status;
                }
                return 1;
            }else{
                return 0;
            }
        }
    }
});