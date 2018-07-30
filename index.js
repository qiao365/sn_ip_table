const sequelize = require('./sequelize').sequelize;
const TABLE_DEFINE = require("./model/model");
const DomainAccountBoxConnect = TABLE_DEFINE.DomainAccountBoxConnect;
const DomainBoxSum = TABLE_DEFINE.DomainBoxSum;
const DomainCoinEveryDay = TABLE_DEFINE.DomainCoinEveryDay;
const fs = require('fs');
const IP2Region = require('ip2region');
const query = new IP2Region();

result = [];
const path = "./result.txt"
if( fs.existsSync(path)) {
    fs.unlinkSync(path);
}

!async function () {
    let boxAccounts = await DomainAccountBoxConnect.findAll({
        //limit: 5,
        where:{
            isBinding:true
        }
    });
    let boxAccountArr = [];

    boxAccounts.forEach((boxAccount) => {
        boxAccount = boxAccount.dataValues;
        if (boxAccount.boxSN && boxAccount.boxSN.length == 14) {
            boxAccountArr.push(boxAccount);
        }
    })
    for (var item of boxAccountArr) {
        let resultObj = {}
        let boxIp = ''
        resultObj.account = item.account;
        resultObj.boxSN = item.boxSN;
        let boxSum = await DomainBoxSum.findOne({
            where: {
                boxSN: item.boxSN
            }
        })

        if (boxSum && boxSum.dataValues) {
            boxIp = boxSum.boxIp;
            if (boxIp && boxIp.startsWith("::ffff:")) { 
                boxIp = boxIp.slice(7);
            } else {
                console.log("fail to get boxip with boxSN" + resultObj.boxSN);
                continue;
            }
            const res = query.search(boxIp);
            if (res) {
                resultObj.province = res.province;
                resultObj.city = res.city;
            }
        }
        resultObj.boxIp = boxIp;
        let sum = await DomainCoinEveryDay.sum("miningCoin",{
            where: {
                boxSN: item.boxSN
            }
        });
        resultObj.sum = sum;
        result.push(resultObj);
        console.log('push',result.length);
    }

    for (var obj of result) {
        var str = obj.account + "    " + obj.boxSN + "    " + obj.boxIp + "    " + obj.province + "    " + obj.city+ "    " + obj.sum + '\n';
        fs.writeFileSync(path, str, {flag: 'a', encoding: 'utf8'});
    }
    console.log('finish');
}();


