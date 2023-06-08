const path = require("path");

const config = {
    myName: ["我的昵称1", "我的昵称2"], // 不要有空格
    herName: ["对方昵称1", "对方昵称2"], // 不要有空格

    rightNum: "110",
    rightName: "name~",

    leftNum: "119",
    leftName: "name",

    fileBaseInputDir: [
        "C:\\Users\\%username%\\AppData\\Roaming\\Tencent\\",
        "D:\\My bak\\QQ\\110\\",
    ],

    rootPath: "QQ-PC-COPY-12345678-20230101",

    DIST_DIR: path.join(__dirname, "./dist/"),

    // imgWebPublicDir: "./data/qq-pc/img",
    // faceWebPublicDir: "./data/qq-pc/face",
    // fileWebPublicDir: "./data/qq-pc/file",
};

config.DIST_DIR_TEMP = path.join(config.DIST_DIR, "_temp");

config.imgWebPublicDir = `./data/${config.rootPath}/img`;
config.faceWebPublicDir = `./data/${config.rootPath}/face`;
config.fileWebPublicDir = `./data/${config.rootPath}/file`;

module.exports = config;
