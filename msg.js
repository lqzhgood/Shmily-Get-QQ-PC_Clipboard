const fs = require('./lib/fs');

const { fileToNodeList } = require('./lib/utils');
const { getPart } = require('./lib/type');

console.log('start');

const nodeList = fileToNodeList();

// 这个必须在最后 因为 nodeList 会被裁剪
const msgArr = getPart(nodeList);

fs.mkdirpSync('./dist');

fs.writeFileSync(`./dist/qq_rich_copy_msg.json`, JSON.stringify(msgArr, null, 4));

console.log('ok');
