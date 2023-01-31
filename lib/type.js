const BodyHandle = require('./bodyHandle');
const { qqToMsg } = require('./conversion');


function getPart(nA) {
    const msgArr = [];
    const START_INDEX = 2;


    let i = START_INDEX; // <NameRow>0 <br>1 <body>2+ <br>-2 <br>-1 <NameRow>0
    while (i) {
        // 如果全部遍历完了
        if (nA.length === 0) break;
        // 仅第一次 检查头部
        if (i === 2) {
            if (!isNameRow(nA[0])[0]) partError('Part [0] not NameRow');
            if (!isNodeByName(nA[1], 'br')) partError('Part [1] not <br>');
        }

        let isTrueRow = false;
        if (i === nA.length) {
            // 如果 i 到了 nA 数组界外，说明是最后一个了。
            // 已经没有下一个 NameRow 用来判断 body 结尾了。
            // 那么直接判断现有全部是否为一个完整消息
            isTrueRow = true;
        } else {
            const node = nA[i];
            isTrueRow = isNameRow(node)[0];
        }

        if (isTrueRow) {
            const partNodes = nA.splice(0, i);
            // 检查尾部
            if (!isNodeByName(partNodes.slice(-1)[0], 'br')) partError('Part [-1] not <br>', partNodes);
            if (!isNodeByName(partNodes.slice(-2)[0], 'br')) partError('Part [-2] not <br>', partNodes);

            const obj = isNameRow(partNodes[0])[1];
            const bodyNodes = partNodes.slice(2, -2);
            const $_body = new BodyHandle(bodyNodes);
            $_body.bodyS.forEach(v => {
                const eO = { ...obj, ...v };
                const msg = qqToMsg(eO);
                msgArr.push(msg);
            });

            i = START_INDEX;
        } else {
            i++;
        }
    }
    console.log('消息总长度:', msgArr.length);
    return msgArr;
}


function partError(msg, node) {
    console.log('node', node);
    debugger;
    throw new Error(msg);
}



/**
 * @name:
 * @description: 用来判断是不是头行 - 日期 姓名
 * @param {*} node
 * @return {*} [Boolean,result]
 */
function isNameRow(node) {
    //   na me， 2016/2/5 0:09:33 不精确ID
    // <br>
    if (!isNodeByName(node, 'text')) return [false, 'Not Text Node'];
    if (!isNodeByName(node.next, 'br')) return [false, 'Next Not Br'];
    const str = node.data;
    const match = str.match(/(.+)\s(\d{4}\/\d{1,2}\/\d{1,2}\s\d{1,2}:\d{2}:\d{2}$)/);
    return match ? [true, { name: match[1], date: match[2] }] : [false, 'Is not Match'];
}

function isNodeByName(node, name) {
    const lN = name.toLocaleLowerCase();
    if (node.type === 'text') return lN === 'text';
    if (node.type === 'tag') return lN === node.name.toLocaleLowerCase();
    debugger;
    throw new Error('unknown Type', node);
}



module.exports = {
    getPart,
};