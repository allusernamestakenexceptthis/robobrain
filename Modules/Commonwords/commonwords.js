const Speaker = require("../Speaker/speaker.js");


var Common = {
    sayOk:function (lang){
        var arr={};
        if (lang=="jp"){
            arr={
                'かしこまりました':"jp",
                'ノープロブレム':"jp",
                'はい、もちろん':'jp'
            }
        }else{
            arr={
                'ok, jedi master':"en",
                'yes, sir':"en",
                'No, problem!':"en",
                'かしこまりました':"jp",
                'ノープロブレム':"jp"
            }
        }

        keys = Object.keys(arr);
        var text=keys[ keys.length * Math.random() << 0];
        var lang=arr[text];
        Speaker.Speak({text:text,lang:lang});

    }
}

/* Expose Module */
module.exports.Common = Common;