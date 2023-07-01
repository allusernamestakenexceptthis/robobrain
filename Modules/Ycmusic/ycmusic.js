const Speaker = require("../Speaker/speaker.js");
const execSync = require('child_process').execSync;
const chromecast = require(__base+'./Modules/Chromecast/chromecast.js');
const CONFIG = require(__base+'./Configs/config.js');



function Start(text,toDo){
    if (text=="play next"){
        return chromecast.Next();
    }else if (text=="play previous"){
        return chromecast.Prev();
    }
    // this should be replaced with a url
    require('child_process').exec(
        'curl "' + CONFIG.YOUTUBE_MUSIC_FETCHING_URL + encodeURIComponent(text)+'&retone=1" ',
        function (error, stdout, stderr) {
            if (stdout){
                chromecast.PlayYoutube(stdout);
                sayOk(toDo.lang);
            }
        }
    );
}

function sayOk(lang){
    require(__base+'./Modules/Commonwords/commonwords.js').Common.sayOk(lang);
}






/* Expose Module */
module.exports.Start = Start;