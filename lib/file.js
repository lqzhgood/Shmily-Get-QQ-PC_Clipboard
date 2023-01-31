/**
 * @name: 提取 dom 中  Img src 路径
 * @description:
 * @param {*}
 * @return {*}
 */

const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const FileType = require('file-type');

const fileList = [];

function getFiles(arr) {
    for (let i = 0; i < arr.length; i++) {
        const n = arr[i];
        if (n.name === 'img') {
            const src = n.attribs.src.replace(/^file:\/{3}/, '');
            fileList.push(src);
        }
    }

    console.log('文件总数', fileList.length);
    const uniq = _.uniq(fileList);
    console.log('文件去重总数', uniq.length);

    fs.writeFileSync('./dist/all_img_src_files.json', JSON.stringify(uniq, null, 4));

    return uniq.sort();
}

async function getExt(sF) {
    const x = await FileType.fromFile(sF);
    if (!x) {
        console.warn('❌', '没有扩展名', sF);
        throw new Error();
    }

    let { ext: ext_l } = x;
    ext_l = `.${ext_l}`;

    const { ext } = path.parse(sF);
    if (ext && ext != ext_l) {
        console.warn('❌', `扩展名不一致 ${sF} / ${ext_l}`);
    }
    return ext_l;
}

module.exports = {
    getFiles,
    getExt,
};
