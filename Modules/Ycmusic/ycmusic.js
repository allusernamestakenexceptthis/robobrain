const Speaker = require("../Speaker/speaker.js");
const execSync = require('child_process').execSync;
const chromecast = require(__base+'./Modules/Chromecast/chromecast.js');



function Start(text,toDo){
   // var url = "https://gomilkyway.com/aws/index.php?text="+encodeURIComponent(text);
    //console.log(url);
    //execSync('wget -qO- '+url+' &> /dev/null ', {stdio:"ignore"} );
    if (text=="play next"){
        return chromecast.Next();
    }else if (text=="play previous"){
        return chromecast.Prev();
    }
    var child = require('child_process').exec(
        'curl "https://www.gomilkyway.com/aws/?text='+encodeURIComponent(text)+'&retone=1" ',
        function (error, stdout, stderr) {
            if (stdout){
                chromecast.PlayYoutube(stdout);
                sayOk(toDo.lang);
            }
        }
    );
    /* check language
    if (toDo.lang){

    }*/
    //Speaker.Speak("ok, jedi master");
}

function sayOk(lang){
    require(__base+'./Modules/Commonwords/commonwords.js').Common.sayOk(lang);
}






/* Expose Module */
module.exports.Start = Start;