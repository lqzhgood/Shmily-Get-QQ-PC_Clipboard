const fs = require('../lib/fs');
const cheerio = require("cheerio");
const path = require('path');


function fileToNodeList() {
    const html = fs.readFileSync(path.join(__dirname, "../input/html.txt"), 'utf-8');
    const $ = cheerio.load(`<div id='_isWrap'>${html}</div>`, { decodeEntities: false });
    const nodeList = $("#_isWrap")[0].children;
    return nodeList;
}



module.exports = {
    fileToNodeList,
};
