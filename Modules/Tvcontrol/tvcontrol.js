const Speaker = require("../Speaker/speaker.js");




function tv_on(){
    require('child_process').exec("cecctvon.sh", {stdio:"ignore"} );
}

function tv_off(){
    require('child_process').exec("cecctvoff.sh", {stdio:"ignore"} );
}


function Start(text,toDo){
    if (text.indexOf("off")!=-1){
        require(__base+'./Modules/Chromecast/chromecast.js').Stop();
        tv_off()
    }else{
        tv_on()
    }

    sayOk(toDo.lang);
}

function sayOk(lang){
    require(__base+'./Modules/Commonwords/commonwords.js').Common.sayOk(lang);
}


/* Expose Module */
module.exports.Start = Start;