/**
 * @name:
 * @description:  1. 从 HTML 中读取 Img-src
 *                3. 修改文件名为 md5
 *                3. 修正正确的后缀名
 *                4. 复制文件到 dist
 *                5. 输出 [ f, md5 ] 对应的 json 到 qq_rich_files_source.json
 * @param {*}
 * @return {*}
 */
const path = require('path');
const md5File = require('md5-file');

const fs = require('./lib/fs');
const config = require('./config');
const { fileToNodeList } = require('./lib/utils');
const { getFiles, getExt } = require('./lib/file');

(async () => {
    const nodeList = fileToNodeList();
    // 获得所有文件路径
    const files = getFiles(nodeList);

    // 复制并重命名为 MD5
    const notExistsFiles = [];
    const outRootDir = path.join(__dirname, './dist/all/');

    const md5Files = [];

    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const obj = { f, md5: '' };
        if (!fs.existsSync(f)) {
            notExistsFiles.push(f);
        } else {
            // f = c:/123/123.txt
            const { dir, base } = path.parse(f);
            const fileSource = path.join(dir, base);
            // 根目录统一
            const baseInputDir = config.fileBaseInputDir.find(d => f.startsWith(d));
            if (!baseInputDir) {
                console.warn('❌', 'not contains dir in config.fileBaseInputDir', dir);
                throw new Error();
            }

            // 得到绝对输出目录
            const relativeOutDir = dir.replace(baseInputDir, '');
            const outDir = path.join(outRootDir, relativeOutDir);
            fs.mkdirpSync(outDir);

            const md5Name = md5File.sync(fileSource);
            obj.md5 = md5Name;

            const ext = await getExt(fileSource);

            fs.copySync(fileSource, path.join(outDir, `${md5Name}${ext}`));
        }
        md5Files.push(obj);
    }

    fs.mkdirpSync(outRootDir);
    fs.writeFileSync(path.join(outRootDir, './qq_rich_files_source.json'), JSON.stringify(md5Files, null, 4));

    if (notExistsFiles.length) {
        console.log('notExistsFiles', notExistsFiles.join('\n'));
    }
    console.log('ok');
})();
