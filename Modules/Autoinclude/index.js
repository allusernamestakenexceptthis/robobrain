
module.exports = function (parent){
    //global.log("tst");
    var normalizedPath = require("path").join(__dirname, "./");

    require("fs").readdirSync(normalizedPath).forEach(function(file) {
    if (file==".." || file=="." || file=="index.js"){
        return;
    }
    module.exports[file] = require("./" + file)(parent);
    });
    return module.exports;
};