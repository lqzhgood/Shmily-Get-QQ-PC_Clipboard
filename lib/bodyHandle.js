const md5File = require('md5-file');
const path = require('path');
const fs = require('../lib/fs');

const config = require('../config');
const faceList = require(`../dist/face/face.json`);

const publicDirImg = path.join(__dirname, '../dist/public/', `./${config.imgWebPublicDir}`);
const publicDirFace = path.join(__dirname, '../dist/public/', `./${config.faceWebPublicDir}`);

fs.mkdirpSync(publicDirImg);
fs.mkdirpSync(publicDirFace);

const elmBr = '<br>'; // QQ 导出 MHT 的时候是 <br> 此处保持一致

const { DICT_忙, DICT_文件, DICT_消息 } = require('./const.js');

class BodyHandle {
    constructor(bodyArr) {
        this.bodyS = [
            { html: '', text: '', type: DICT_消息 }, // 可能有多个
        ];
        this.init(bodyArr);
    }

    get lastMsg() {
        return this.bodyS.slice(-1)[0];
    }

    init(bodyArr) {
        bodyArr.reduce((pre, cV) => {
            if (cV.type === 'text') return pre + cV.data;
            if (cV.type === 'tag' && cV.name === 'br') return pre + elmBr;
            if (cV.type === 'tag' && cV.name === 'img') return pre + cV.attribs.alt ? `[${cV.attribs.alt}]` : '[图]';
            throw new Error('unknown Type', cV);
        }, '');

        bodyArr.forEach(n => {
            if (n.type === 'text') {
                const t = n.data;
                const TYPE = this.typeHandle(t);
                let afterHtml = '';
                if (TYPE === DICT_文件) {
                    // 新的一条 需要把上一条的两个换行的格式去掉
                    this.lastMsg.html = this.lastMsg.html.replace(new RegExp(`${elmBr}${elmBr}$`), '');
                    this.lastMsg.text = this.lastMsg.text.replace(new RegExp(`\n\n$`), '');

                    // 当前 html 提供直接打开的方式
                    const fileName = t.match(/^对方已成功接收了您发送的离线文件“(.+)”.+/)[1];
                    const filePath = `${config.fileWebPublicDir}/${fileName}`;

                    // !!! 通过 fix 处理文件得到 $QQ.data.fileParse ,然后用前端显示,这样更灵活
                    // * 为相关注释代码

                    // 注意与 HtmlToJson 的 html 保持一致
                    // * afterHtml += `<br/><a href='${filePath}' target='_blank' class='openFile'>打开文件</a>`;

                    const ext = path.extname(fileName);
                    if (!ext) {
                        console.warn(`无后缀名文件 ${fileName}`);
                    } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext.toLocaleLowerCase())) {
                        // * afterHtml += `<br/><img src='${filePath}' />`;
                    } else {
                        console.warn(`HTML 不做额外处理的后缀 |${ext}| - ${fileName}`);
                    }

                    // 插入一个新 Msg 这样上面的会写入新 msg 中
                    this.addMsg();
                }

                this.lastMsg.html += t + afterHtml;
                this.lastMsg.text += t;
                this.lastMsg.type = TYPE;
                return;
            }
            if (n.type === 'tag' && n.name === 'br') {
                this.lastMsg.html += elmBr;
                this.lastMsg.text += `\n`;
                return;
            }
            if (n.type === 'tag' && n.name === 'img') {
                //  src 绝对路径转换为相对路径 文件名重命名为 md5
                const src = n.attribs.src.replace(/^file:\/{3}/, '');
                if (fs.existsSync(src)) {
                    const md5 = md5File.sync(src);
                    const face = faceList.find(v => v.md5 === md5);
                    let fileMd5Dir;
                    // 判断是否为表情 使用相应目录
                    if (!face) {
                        const { ext } = path.parse(src);
                        const name = `${md5}${ext}`;
                        fileMd5Dir = `${config.imgWebPublicDir}/${name}`;
                        fs.copyFileSync(src, path.join(publicDirImg, name));
                    } else {
                        n.attribs.alt = face.alt;
                        n.attribs.title = face.alt;
                        const name = `${face.md5}${face.ext}`;
                        fileMd5Dir = `${config.faceWebPublicDir}/${name}`;
                        fs.copyFileSync(src, path.join(publicDirFace, name));
                    }
                    n.attribs.src = fileMd5Dir;
                } else {
                    console.log('file not found', src);
                }
                const attr = Object.keys(n.attribs)
                    .map(k => `${k}='${n.attribs[k]}'`)
                    .join(' ');
                this.lastMsg.html += `<img ${attr} />`;

                if (n.attribs.alt) {
                    this.lastMsg.text += `[${n.attribs.alt}]`;
                } else {
                    this.lastMsg.text += `[图]`;
                }
                return;
            }
            throw new Error(`unknown Type ${n.type} ${n.name}`);
        });
    }

    typeHandle(t) {
        if (/我现在有事不在.{1}一会再和你联系/.test(t)) {
            return DICT_忙;
        }
        // 必须基于 text elmBr-<br> 被处理为 \n 的情况使用
        // 对方已成功接收了您发送的离线文件“TB261XmrsuYBuNkSmRyXXcA3pXa_!!0-rate.jpg_400x400.jpg”(24.92KB)。
        else if (/^对方已成功接收了您发送的离线文件“(.+)”.+/.test(t)) {
            return DICT_文件;
        } else {
            return DICT_消息;
        }
    }

    addMsg() {
        this.bodyS.push({ html: '', text: '', type: DICT_消息 });
    }
}

module.exports = BodyHandle;
