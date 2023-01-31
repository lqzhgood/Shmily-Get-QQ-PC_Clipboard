const fs = require('../lib/fs');
const path = require('path');

const { getExt } = require('../lib/file');

(async () => {
    const diyFaceNotHaveAlt = [];

    const tempDir = path.join(__dirname, '../temp');
    const diyFaceDir = path.join(tempDir, 'diyFace');
    fs.mkdirpSync(diyFaceDir);

    const faceDir = path.join(__dirname, `../dist/`, './all/QQTempSys');

    fs.copySync(faceDir, diyFaceDir);
    const systemFace = require(path.join(tempDir, `./sysFace_dict_have_alt.json`));

    const faceFileList = fs.readdirSync(diyFaceDir);
    for (let i = 0; i < faceFileList.length; i++) {
        const f = faceFileList[i];
        const thisFileDir = path.join(diyFaceDir, f);
        const { name } = path.parse(thisFileDir);
        const ext = await getExt(thisFileDir);

        const md5IsEqual = systemFace.find(v => v.md5 === name);
        const nameIsEqual = systemFace.find(v => v.md5 === name && v.ext === ext);

        if (md5IsEqual) {
            if (!nameIsEqual) throw new Error(`same file not same ext ${name}${ext}`);
            fs.unlinkSync(thisFileDir);
        } else {
            const { size } = fs.statSync(thisFileDir);
            diyFaceNotHaveAlt.push({
                md5: name,
                ext,
                alt: '',
                size, // 用来排序
            });
        }
    }
    const diyFaceNotHaveAlt_sort = diyFaceNotHaveAlt.sort((a, b) => a.size - b.size);

    fs.writeFileSync(path.join(tempDir, 'diyFace_dict.json'), JSON.stringify(diyFaceNotHaveAlt_sort, null, 4));
    console.log('diyFace.length', diyFaceNotHaveAlt_sort.length);
})();
