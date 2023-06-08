const fs = require("./lib/fs");

const { rootPath } = require("./config");
const { fileToNodeList } = require("./lib/utils");
const { getPart } = require("./lib/type");

console.log("start");

const nodeList = fileToNodeList();

// 这个必须在最后 因为 nodeList 会被裁剪
const msgArr = getPart(nodeList);

fs.mkdirpSync("./dist");

fs.writeFileSync(`./dist/${rootPath}.json`, JSON.stringify(msgArr, null, 4));

console.log("ok");
