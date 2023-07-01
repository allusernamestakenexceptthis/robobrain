const Speaker = require("../Speaker/speaker.js");

let commandTypes = {
    'play':{'type':"ycmusic",'lang':"en"},
    'をプレイして':{'type':"ycmusic",'lang':"jp"},
    'をプレイ':{'type':"ycmusic",'lang':"jp"},
    'プレイして':{'type':"ycmusic",'lang':"jp"},
    'プレイ':{'type':"ycmusic",'lang':"jp"},
    'を再生して':{'type':"ycmusic",'lang':"jp"},
    '再生して':{'type':"ycmusic",'lang':"jp"},
    '再生':{'type':"ycmusic",'lang':"jp"},
    'turn':{'type':"tvcontrol",'lang':"en"},
};

/*
var botActionType={
    "media.music_play":{'type':"ycmusic"}
};
*/

function ProcessPlain(m,lang){
    return Process(
        {
            recognized:{
                transcript:m
            },
            info: {},
            lang:lang
    
        }
    );
}

function Process(m){
    //try to get closer to intent later
    //let lang=m.lang;
    let jsonText=m.recognized;
    if (!jsonText.transcript){
        sorryDontKnow();
        return;
    }

    


    let text=jsonText.transcript.toLowerCase();

    if (!m.info){
        m.info={};
    }

    if (m.info.type=="question"){

        m.info.questionCallback(text);
        return;
    }

    let k;
    let re;
    let toDo;
    if (m.info.assumeCommand){
        k = m.info.assumeCommand;
        if (commandTypes[k]){
            toDo = commandTypes[k];
            re = new RegExp(k,"g");
            text.replace(re,"");
            return goProcess(text,toDo);
        }else{
            console.log("no such command "+m.info.assumeCommand);
        }
    }


    try {
        

        for (k in commandTypes) {
            if (text.indexOf(k)!=-1){ 
                toDo = commandTypes[k];
                toDo.originalText=text;
                re = new RegExp(k,"g");
                text.replace(re,"");
                return goProcess(text,toDo);
            }
        }

        //this section used now a discontinued api.ai which is now dialogflow
        // you can add dialogflow logic here


    }catch (err){
        console.log(err);
        gotError();
    }

}

function gotError(){
    Speaker.Speak("Oops, encountered an error.");
}

function sorryDontKnow(lang){
    if (lang=="jp"){
        Speaker.Speak({text:"ぜんぜんわかんない。です",lang:lang});
    }else{
        Speaker.Speak("Sorry, don't know");
    }
}

function goProcess(text,toDo){
    if (toDo.type=="callback"){
        return toDo.callback(text,toDo);
    }

    try{
        let proc = require("../"+ucfirst(toDo.type)+"/"+toDo.type+".js");
        proc.Start(text,toDo);
    }catch (err){
        console.log(err);
    }
}

function ucfirst(value){
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function RegisterHooks(obj){
    commandTypes = extend({}, commandTypes, obj);
}

function extend(target) {
    let sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (let prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}


/* Expose Module */
module.exports.Process = Process;
module.exports.ProcessPlain = ProcessPlain;
module.exports.RegisterHooks = RegisterHooks;