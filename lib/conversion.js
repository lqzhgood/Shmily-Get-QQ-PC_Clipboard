const dayjs = require('dayjs');
const cheerio = require('cheerio');
const _ = require('lodash');

const { DICT_文件 } = require('./const.js');
const config = require('../config');

//   {
//         "name": "name",
//         "date": "2018/5/11 09:49:23",
//         "text": "text",
//         "html": "html"
//     },

exports.qqToMsg = function (obj) {
    const date = dayjs(obj.date);

    const name = obj.name;
    const direction = directionHandle(name);
    const send = {};
    const receive = {};

    if (direction === 'go') {
        config.rightName = name;

        send.sender = config.rightNum;
        send.senderName = config.rightName;

        receive.receiver = config.leftNum;
        receive.receiverName = config.leftName;
    }

    if (direction === 'come') {
        config.leftName = name;

        send.sender = config.leftNum;
        send.senderName = config.leftName;

        receive.receiver = config.rightNum;
        receive.receiverName = config.rightName;
    }

    const msg = {
        source: 'QQ',
        device: 'PC',
        type: obj.type,

        direction,

        ...send,
        ...receive,

        day: date.format('YYYY-MM-DD'),
        time: date.format('HH:mm:ss'),
        ms: date.valueOf(),

        content: obj.text,
        html: toHtml(obj.html),

        msAccuracy: false,
    };
    if (obj.type === DICT_文件) {
        _.set(msg, '_Dev.warn', '[time] 时间取的上一条的记录，需要手动补充');
    }
    return msg;
};

function directionHandle(name) {
    if (config.myName.find(n => name.replace(/\s/g, '').includes(n))) return 'go';
    if (config.herName.find(n => name.replace(/\s/g, '').includes(n))) return 'come';
    throw new Error(`unknown name |${name}|`);
}

// 目的是为了格式化  例如标签中的 " ' 区别
function toHtml(html) {
    const $ = cheerio.load(`<div id='innerHtml'>${html}</div>`, { decodeEntities: false });
    return $('#innerHtml').html();
}
