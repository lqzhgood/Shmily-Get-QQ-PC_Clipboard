const fs = require('../lib/fs');
const path = require('path');
const _ = require('lodash');

const outDIr = path.join(__dirname, `../dist/face/`);
fs.mkdirpSync(outDIr);
const tempDIr = path.join(__dirname, '../temp');

const moreFaceDir = path.join(__dirname, './moreFaceJson/');
const moreFaceFiles = fs.readdirSync(moreFaceDir);
const moreFaceArr = _.flatten(moreFaceFiles.map(f => fs.readJsonSync(path.join(moreFaceDir, f))));

// system 表情 复制到 Assets
const sysFaceDir = path.join(tempDIr, './sysFace/');
const sysFace_dict_have_alt = require(path.join(tempDIr, `./sysFace_dict_have_alt.json`));
// sysFace_dict_have_alt.forEach(f => {
//     const thisFileDir = path.join(sysFaceDir, `./${f.sysface} - ${f.md5}${f.ext}`);
//     fs.renameSync(thisFileDir, path.join(sysFaceDir, `${f.md5}${f.ext}`));
// });

// fs.copySync(sysFaceDir, outDIr);
// fs.removeSync(sysFaceDir);

// // Diy 表情 复制到 Assets
// const diyFaceDir = path.join(tempDIr, './diyFace/');
const diyFace_dict_have_alt = require(path.join(tempDIr, `./diyFace_dict_have_alt.json`));
// fs.copySync(diyFaceDir, outDIr);
// fs.removeSync(diyFaceDir);

const mergerFace = sysFace_dict_have_alt.concat(diyFace_dict_have_alt);

/**
 * @name:
 * @description: 排除掉在 moreFace 中的的表情
 * @param {*}
 * @return {*}
 */
const mergerFaceUniq = mergerFace.filter(f => {
    const find = moreFaceArr.find(mf => f.md5 === mf.md5);
    if (find) {
        if (!_.isEqual(f, find)) {
            console.warn('❌', '相同 md5 不同, 合并表情内容不同');
            console.log(JSON.stringify(f, null, 4));
            console.log(JSON.stringify(find, null, 4));
            throw new Error();
        }
    }
    return !find;
});
console.log(JSON.stringify(mergerFaceUniq, null, 4));
const allFace = mergerFaceUniq.concat(moreFaceArr);

console.log('合并 more face 前数量', mergerFace.length);
console.log('合并 more face 后去重数量', mergerFaceUniq.length);
console.log('合并 more face 后数量', allFace.length);

fs.writeFileSync(path.join(outDIr, './face.json'), JSON.stringify(allFace, null, 4));
