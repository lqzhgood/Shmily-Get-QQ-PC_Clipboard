# 说明

请先阅读 https://github.com/lqzhgood/Shmily

此工具是将 QQ 电脑版 聊天窗复制出来的富文本转换为 `Shmily-Msg` 格式的工具

MHT 只能按顺序导出, 如果数据库中间损坏, 就只能导出 _前半段_. (我就是这种情况)

那么可以从后往前通过聊天窗拿到后半段的聊天记录，通过复制的方式通过富文本方式拷贝出来。<br/>

富文本拷贝会丢失大量样式，此为下下策。 <br/>
建议优先使用 https://github.com/lqzhgood/Shmily-Get-QQ-PC_MHT

## 使用方法

#### 初始化

-   安装 node 环境 [http://lqzhgood.github.io/Shmily/guide/setup-runtime/nodejs.html]
-   修改 `config.js`

    ```js
    module.exports = {
        // 会拿这两个数组中的名字对比得到 `${msg} direction`
        myName: ['a', 'b'], // 不要有空格
        herName: ['c', 'e', 'f'], // 不要有空格

        // 用来填充 `${msg} send receiver`
        rightNum: '123',
        rightName: 'a',

        leftNum: '456',
        leftName: 'b',

        // html 中涉及到的文件主路径 会按此主路径复制文件（含子文件夹）到 $dist-$file
        // 如填写 'D:\\My bak\\QQ\\1111\\', 当 html 涉及到下列2个目录
        // D:\\My bak\\QQ\\1111\\Image\\A
        // D:\\My bak\\QQ\\1111\\B\\ZZZ
        // $dist-$file 下会有  【\\Image\\A】 【\\B\\ZZZ】 两个目录

        // 资源文件夹
        fileBaseInputDir: ['C:\\Users\\%username%\\AppData\\Roaming\\Tencent\\', 'D:\\My bak\\QQ\\1111\\'],
    };
    ```

#### 复制富文本

-   建议清空 `C:\Users\${user}\AppData\Roaming\Tencent\QQTempSys\` 这样滚动出来就全是用到的自定义表情
-   用按键精灵等工具滚动获取足够多的聊天记录，从 QQ 聊天窗复制，粘贴到 `./tool/copy.html` 的输入框中，点击下载。放至 `./input/html.txt` <br/>

    html.txt 结构 仅有三个元素 `<text>` `<img>` `<br>`

#### 1 提取图片

-   通过执行 `npm run getImgSrcFile` 可以提取当前 HTML 中用到的图片至 `./dist` 路径下,保留子路径并以 `MD5` 重命名，生成包含所有图片属性的 `qq_rich_files_source.json`
-   所有 Html Img 用到的图片会生成 `.\dist\all_img_src_files.json`，通过比较 `QQTempSys` 会发现有很多并不在其中，这些不在 `all_img_src_files.json` 中的图片就是未复制到的

###### 1.1 (可选) 复制未在 Html 中被遗漏的 QQTempSys 并转格式到 dist\QQTempSys

-   执行命令 `npm run coverQQTempSys`
-   将会把 `C:\Users\${user}\AppData\Roaming\Tencent\QQTempSys\` 下的文件在排除 `.\dist\all\QQTempSys`后复制到 `.\dist\QQTempSys` 下并修改文件名为 md5
    <br/>

##### 图片说明

-   html.txt 中的 `<img>` 仅有两个属性(attrib) `src` `sysface`

-   如果含 `sysface` 则是系统表情，图片在 `C:\Users\${user}\AppData\Roaming\Tencent\QQTempSys\` 目录下 <br/>
-   不含 `sysface` 也可能在 `C:\Users\${user}\AppData\Roaming\Tencent\QQTempSys\` 目录下，这些应该是自定义表情。<br/>
    <br/>

#### 2 表情

##### 2.1 复制系统表情并生成 [sysFace_dict.json] 待补充 Alt

-   执行命令 `npm run getSysFace` <br/>

-   将包含 `sysface` 属性的图片，生成 `sysFace_dict.json`, 并复制到 `./temp/sysface/` 下面以 `${sysface} - ${md5}` 命名，方便对比查看，其中这个 `json` 会按照文件大小从小到大排列，这样文件浏览器也按同样规则排序后可以一一对应方便查看图片 <br/>

*需要手动补充*数组中每个对象的 `alt` 属性，这个属性最终会替代 [表情图片] 写入`${msg} content` 里面。补充完毕后将 `sysFace_dict.json` 重命名为 `sysFace_dict_have_alt.json` 路径下，不然重新运行 `npm run getSysFace` 将会覆盖。

<br/>

##### 2.2 删除系统表情并生成 [diyFace_dict.json] 待补充 Alt

-   执行命令 `npm run getDiyFace` <br/>

-   读取 1 中提取的 `.\dist\all\QQTempSys` 并复制到 `.\temp\diyFace` 下
-   删除重复的 [系统表情图片], 生成 `diyFace_dict.json` 等待补充 [Diy 表情] 的 `Alt` 属性。<br/>其中这个 `json` 会按照文件大小从小到大排列，这样文件浏览器也按同样规则排序后可以一一对应方便查看图片 <br/>

*需要手动补充*数组中每个对象的 `alt` 属性，补充完毕后将 `diyFace_dict.json` 重命名为 `diyFace_dict_have_alt.json` 不然重新运行 `npm run delUniqSystemFace` 将会覆盖。

<br/>

#### 2.3 合并 [sysface_dict_have_alt.json] 和 [diyFace_dict_have_alt]

##### 2.3.1 tool\moreFaceJson 下的 JSON 也会被合并进去 可以自行添加更多表情包补充 ALT

-   命令 `npm run mergerFace` <br/>

-   `sysFace_dict_have_alt` <br/>
    重命名 `./temp/sysFace/` 文件夹中文件， `./${f.sysface} - ${f.md5}${f.ext}` ==> `${f.md5}${f.ext}`<br/>
    复制 `./temp/sysFace/` ==> `./dist/face/`<br/>
    删除 `./temp/sysFace/`<br/>

-   `diyFace_dict_have_alt` <br/>
    复制 `./temp/diyFace/` ==> `./dist/face/` <br/>
    删除 `./temp/diyFace/`<br/>

<br/>

#### 2.4 表情处理完成

`./dist/face` 下会得到所有 [表情]，并生成 `./face.json`，用于下一步生成 `${msg}`

#### 3 修复

通过 [Shmily-Get-QQ-PC_utils](https://github.com/lqzhgood/Shmily-Get-QQ-PC_utils) 修复一些问题

## 消息

```
ID 不精确
```

命令 `npm run msg` <br>

执行后将读取上一步获取的 `./face.json`, 消息中包含的图片会计算 `md5` 与之比对，如果符合则判断为表情。<br>
如果为表情，则 ${msg.content} 会显示 [${alt}] 否则会显示 [图]。<br/>

并复制图片到 `./dist / ${config.imgWebPublicDir}; 并复制表情到 `./dist / ${config.faceWebPublicDir};

并在 `./dist` 下生成 `qq_rich_copy_msg.json.json`

## ！丢失消息！ 以下类型 QQ 聊天窗不显示 就无法复制

可查看 `can't get type` 中的示例

```
本地图片不存在的不会显示。(空图片占位)

视频不会显示

发送过去的文件消息不会显示(对方接收信息会显示)

自己接收的文件消息不会显示

对方接收文件信息会显示 但是没有时间 需要自行补充

QQ 解析的链接，例如微信等链接会被微信Get到标题等信息直接显示，而不是显示纯链接,所以无法复制

自定义表情大部分丢失(QQTempSys)
```

## 感谢

http://lqzhgood.github.io/Shmily/guide/other/thanks.html

## 捐赠

点击链接 http://lqzhgood.github.io/Shmily/guide/other/donation.html 看世界上最可爱的动物
