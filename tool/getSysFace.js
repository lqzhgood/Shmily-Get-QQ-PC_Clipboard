const _ = require('lodash');
const md5File = require('md5-file');
const path = require('path');
const fs = require('../lib/fs');

const { fileToNodeList } = require('../lib/utils');
const { getExt } = require('../lib/file');

const tempDir = path.join(__dirname, '../temp');
const sysFaceDir = path.join(tempDir, 'sysFace');
fs.mkdirpSync(sysFaceDir);

const nodeList = fileToNodeList();

const arr = [];

for (let i = 0; i < nodeList.length; i++) {
    const n = nodeList[i];
    if (n.name === 'img' && n.attribs.sysface) {
        arr.push(n.attribs);
    }
}

const arr_uniq = _.uniqBy(arr, v => `${v.src}------${v.sysface}`).sort((a, b) => {
    return a.sysface * 1 - b.sysface * 1;
});

const arr_set_uniq = _.uniq(arr.map(v => v.sysface));
if (arr_uniq.length === arr_set_uniq.length) {
    console.log('表情和相对应的文件一致 检查通过');

    (async () => {
        for (let i = 0; i < arr_uniq.length; i++) {
            const v = arr_uniq[i];
            const src = v.src.replace(/^file:\/{3}/, '');

            const ext = await getExt(src);

            const { size } = fs.statSync(src);
            const md5 = md5File.sync(src);
            v.type = 'system';
            v.src = src;
            v.md5 = md5;
            v.ext = ext;
            v.size = size;

            fs.copySync(src, path.join(sysFaceDir, `${v.sysface} - ${md5}${ext}`));
        }
    })();

    const arr_uniq_sort = arr_uniq.sort((a, b) => a.size - b.size);
    fs.writeFileSync(path.join(tempDir, './sysFace_dict.json'), JSON.stringify(arr_uniq_sort, null, 4));
} else {
    console.log('校验失败');
}

console.log('arr', arr_uniq.length);
