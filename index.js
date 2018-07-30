const sequelize = require('./sequelize').sequelize;
const TABLE_DEFINE = require("./model/model");
const DomainAccountBoxConnect = TABLE_DEFINE.DomainAccountBoxConnect;
const DomainBoxSum = TABLE_DEFINE.DomainBoxSum;
const DomainCoinEveryDay = TABLE_DEFINE.DomainCoinEveryDay;
const fs = require('fs');
const IP2Region = require('ip2region');
const query = new IP2Region();

result = [];
const path = "./result_cjq.txt"
if( fs.existsSync(path)) {
    fs.unlinkSync(path);
}

!async function () {
    let boxSum = await DomainBoxSum.findAll();

    let boxSUMArr = [];

    boxSum.forEach((boxsunitem) => {
        item = boxsunitem.dataValues;
        if (item.boxSN && item.boxSN.length == 14) {
                boxSUMArr.push(item);
        }
    });
    return digui(0,200,200,boxSUMArr).then(finish=>{
        console.log('finish');
    });
}();


function digui(start , end, limit ,arraySN){
    let data = arraySN.slice(start,end);
    return deal(data).then((back)=>{
        if(end < arraySN.length){
            return digui(start+limit, end+limit, limit, arraySN);
        }
    });
}


function deal(boxSUMArr){
    let boxSumAll = boxSUMArr.map(item=>{
        let resultObj = {}
        let boxIp = ''
        return DomainAccountBoxConnect.findOne({
            where:{
                boxSN:item.boxSN,
                isBinding:true
            }
        }).then(boxAccount=>{
            resultObj.account = boxAccount ? boxAccount.account : "           ";
            resultObj.boxSN = item.boxSN;
            boxIp = item.boxIp;
            if (boxIp && boxIp.startsWith("::ffff:")) { 
                boxIp = boxIp.slice(7);
            } else {
                // console.log("fail to get boxip with boxSN" + resultObj.boxSN);
                return;
            }
            const res = query.search(boxIp);
            if (res) {
                resultObj.province = res.province;
                resultObj.city = res.city;
            }
    
            resultObj.boxIp = boxIp;
            return DomainCoinEveryDay.sum("miningCoin",{
                where: {
                    boxSN: item.boxSN
                }
            }).then(sum=>{
                resultObj.sum = sum ? sum : 0;
                result.push(resultObj);
                let str = resultObj.account + "    " + resultObj.boxSN + "    " + resultObj.boxIp + "    " + resultObj.province + "    " + resultObj.city+ "    " + resultObj.sum + '';
                console.log(result.length,str);
                return resultObj;
            });
        });
    });
    return Promise.all(boxSumAll).then(resultObjs=>{
        for (var obj of resultObjs) {
            if(obj){
                var str = obj.account + "    " + obj.boxSN + "    " + obj.boxIp + "    " + obj.province + "    " + obj.city+ "    " + obj.sum + '\n';
                fs.writeFileSync(path, str, {flag: 'a', encoding: 'utf8'});
            }
        }
        // console.log('finish');
        return resultObjs;
    });
}


