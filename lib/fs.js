const fse = require('fs-extra');


const copySync = function (src, dest, options = {}) {
    return fse.copySync(src, dest, { preserveTimestamps: true, ...options });
};


const fs = { ...fse, copySync };



module.exports = fs;
