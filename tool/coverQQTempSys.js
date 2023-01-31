const fs = require('../lib/fs');
const path = require('path');
const md5File = require('md5-file');

const { getExt } = require('../lib/file');
const inputDir = 'I:\\tmp\\QQTempSys - 副本';
const outDir = path.join(__dirname, '../dist/all/QQTempSys-notInHtml/');
fs.mkdirpSync(outDir);

const files = fs.readdirSync(inputDir);

const inHtmlSysFaceFiles = fs.readdirSync(path.join(__dirname, '../dist/all/QQTempSys/'));

(async () => {
    for (let i = 0; i < files.length; i++) {
        const f = files[i];

        const sourceFile = path.join(inputDir, f);

        const md5 = md5File.sync(sourceFile);
        const ext = await getExt(sourceFile);

        const targetFile = `${md5}${ext}`;

        const inHtml = inHtmlSysFaceFiles.some(sf => sf == targetFile);

        if (!inHtml) {
            fs.copySync(sourceFile, path.join(outDir, targetFile));
        }
    }
})();
