
'use strict';
require('./Configs/config.js');


//var Player = require('player');
const record = require(__base+'./Modules/Recorder/record.js');
var speech_proc = null;
var emodules = null;
const {Detector, Models} = require('snowboy/');


const Speaker = require(__base+"./Modules/Speaker/speaker.js");
const Player = require(__base+"./Modules/Player/player.js");
const execSync = require('child_process').execSync;
const Proccessor = require(__base+"./Modules/Processor/process.js");
const Speech = require (__base+"./Modules/Speech/speech.js");
const chromecast = require(__base+'./Modules/Chromecast/chromecast.js');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;

var ts = require('tail-stream');

const models = new Models();

const queue_file = "queue-message.txt";
var isbusy=false;
var dat="";
var lastSound=get_current_time();
var silenceThreshold=600; //threshold to consider long silence
var soundCounterThreshold=3; //threshold to consider sound sufficecnt and over to ignore.
var afterSilenceThreshold=10 //threshold for silence after sound


var activateBeingOnSilence=false;
var silenceLength=0;
var soundCounter=0;
var lastTimeOnSilentCalled=0;
var enableWakeupCall=true;
var hooks = {};




console.log("started");
execSync('truncate -s 0 '+queue_file, {stdio:"ignore"} );

var externalQueue = ts.createReadStream(queue_file, {
    beginAt: 0,
    onMove: 'follow',
    detectTruncate: false,
});


models.add({
    file: 'node_modules/snowboy/resources/snowboy.umdl',
    sensitivity: '0.6',
    hotwords : 'snowboy'
});
/*
models.add({
    file: 'node_modules/snowboy/resources/raspberry.pmdl',
    sensitivity: '0.3',
    hotwords : 'raspberry'
});
*/
/*
models.add({
    file: 'node_modules/snowboy/resources/gozira.pmdl',
    sensitivity: '0.1',
    hotwords : 'gozira'
});

models.add({
    file: 'node_modules/snowboy/resources/raspberry.pmdl',
    sensitivity: '0.5',
    hotwords : 'raspberry'
});
*/
/*
models.add({
    file: 'node_modules/snowboy/resources/Next.pmdl',
    sensitivity: '0.6',
    hotwords : 'next'
});

models.add({
    file: 'node_modules/snowboy/resources/Previous.pmdl',
    sensitivity: '0.3',
    hotwords : 'previous'
});*/

/*
models.add({
    file: 'node_modules/snowboy/resources/gojira.pmdl',
    sensitivity: '0.4',
    hotwords : 'ゴジラ'
});*/

/*
models.add({
    file: 'node_modules/snowboy/resources/Brainet.pmdl',
    sensitivity: '0.5',
    hotwords : 'brainet'
});*/
/*
models.add({
    file: 'node_modules/snowboy/resources/dingdong.pmdl',
    sensitivity: '0.5',
    hotwords : 'dingdong'
});*/


const detector = new Detector({
    resource: "node_modules/snowboy/resources/common.res",
    models: models,
    audioGain: 1.5
});

detector.on('silence', function () {
    var hook_name="snowboy_silence";
    //console.log('silence '+silenceLength+" "+soundCounter+" "+activateBeingOnSilence);
    soundCounter=0;
    if (silenceLength<silenceThreshold){
        silenceLength++;
    }

    if (activateBeingOnSilence==true && silenceLength>afterSilenceThreshold){
        activateBeingOnSilence=false;
        callActivateOnSilence();
    }

    public_functions.callAHook(hook_name,{"silenceLength":silenceLength});
});

detector.on('sound', function () {
    var hook_name="snowboy_sound";
    var curtime=get_current_time();
    // console.log('sound'+(curtime-lastSound));
    if (curtime-lastSound<2){
        soundCounter++;
        //if (silenceLength>silenceThreshold || activateBeingOnSilence){
            if (soundCounter==soundCounterThreshold){
                if (silenceLength>=silenceThreshold){
                    activateBeingOnSilence=true;
                }
                silenceLength=0;
            }
            if (soundCounter>soundCounterThreshold+3){
                activateBeingOnSilence=false;
                silenceLength=0;
            }
        //}
    }

    public_functions.callAHook(hook_name,{"soundCounter":soundCounter,'lastSound':lastSound});
    lastSound=curtime;
});

detector.on('error', function () {
    //console.log('error');
});

detector.on('hotword', function (index, hotword) {
    //console.log('hotword', index, hotword);
    return hotword_detected(hotword);

});










//forkSpeech("jp");

var mic = null;
startSnowboy();
//sphinxDetector();
console.log("listening..");

//chromecast.Start();

//bulb.test();


setTimeout(function(){

    startQueue();

    //Speaker.Speak("Ttan,I");
    //console.log("test");
    //recordWav();
    //callActivateOnSilence();
    //goodMorning();
    //
  //  playNext();
   
    /*
    chromecast.PlayYoutube('LELFIuhSPCI&list=RDLELFIuhSPCI');
    setTimeout(function(){
        chromecast.Stop();
    },27000);*/
    //chromecast.PlayYoutube('LELFIuhSPCI');//&list=PLFO0esT_hEQSS4vqO1nh5i6TRyIvsMXAN
    //chromecast.PlayYoutube("https://r1---sn-ogueln7r.googlevideo.com/videoplayback?sparams=dur%2Cei%2Cid%2Cinitcwndbps%2Cip%2Cipbits%2Citag%2Clmt%2Cmime%2Cmm%2Cmn%2Cms%2Cmv%2Cpl%2Cratebypass%2Crequiressl%2Csource%2Cupn%2Cexpire&id=o-APapg-jNCGPALUnA171ztU8iiiK45nmD5hIWDvwUfCLE&initcwndbps=2090000&ip=153.226.87.64&ei=uKHWWPneJMqS4ALSxbCgDw&dur=55.681&mv=m&mt=1490460992&ms=au&mn=sn-ogueln7r&source=youtube&mm=31&upn=wWcsU0nZxxA&lmt=1472328189356236&itag=22&key=yt6&mime=video%2Fmp4&ipbits=0&pl=22&ratebypass=yes&requiressl=yes&expire=1490482712&signature=3ABC033BF62A0CB9FB3C4E52330DA0AD728ABB28.7ADE782026A846B6C7BB713DA29A4FFDD889CE32");
    /*Proccessor.Process({
        lang:"en", 
        recognized:{
            transcript:"record audio"
        }
    });*/
    //Proccessor.RegisterHooks({"tst":{'type':"callback",'lang':"en"}});
},1000)


/*
function recordWav(){
    registerHook("recordWave",{
        module: "snowboy_silence",
        test: { 
            "var":"silenceLength",
            "rule":"=",
            "value":3
        },
        callback: function(res){
            console.log(res);
        },
        times: "once"
    });
}
*/

var public_functions={
    /*
        Hook format:
        id: unique_id
        params{
            module: module/function name e.g. snowboy_silence,
            test { 
                var: variable name to test
                rule: = != < > 
                value: target value
            },
            callback: callback function,
            times: how many times to run, once or continuous
        }

    */

    registerHook:function(id,params){
        //var index=Object.keys(hooks).length;
        module = params.module;
        delete params.module;
        if (!hooks[module]){
            hooks[module]={};
        }
        hooks[module][id]=params;
    },


    callAHook:function (module,params){
        var targetHook=hooks[module];
        if (!targetHook)return false;

        var condition_met=false;

        for (var k in targetHook){
            if (targetHook[k].test){
                var rule=targetHook[k].test.rule;
                if (!rule){
                    rule="="
                }
                switch(rule){
                    case "=":
                        if (params[targetHook[k].test.var]==targetHook[k].test.value){
                            condition_met=true;
                        }
                    break;
                }
            }else{
                //has no test, so condition met
                condition_met=true;
            }

            if (condition_met){
                targetHook[k].callback(params);
                //if set to run once, then delete it if it is set to run once.
                if (targetHook[k].times && targetHook[k].times==1){
                    delete targetHook[k];
                }
            }
        }
    },

    //prevents listener from waking up even upon detection.
    enableWakeup:function(enabled){
        enableWakeupCall=enabled;
        console.log(enabled);
    }
};

function startQueue(){
    externalQueue.on('data', function(data) {
        data = ""+data
        console.log("got data: " + data);
        
        var arrayOfLines = data.match(/[^\r\n]+/g); 
        for (var i in arrayOfLines) {
            var val = arrayOfLines[i];
            if (val.indexOf("robobrainJP ")!=-1){
                val = val.replace("robobrainJP ","");
                console.log("robojp detected: " + data);
                //stopSnowboy();
                //isbusy=true;
                Proccessor.ProcessPlain(val,"jp");
                
            }else if (val.indexOf("robobrain ")!=-1){
                val = val.replace("robobrain ","");
                console.log("robo detected: " + data);
                stopSnowboy();
                isbusy=true;
                Proccessor.ProcessPlain(val,"en");
                
            }
        }

    })

}

function hotword_detected(hotword){
    console.log(hotword);
    if (!enableWakeupCall){
        return false;
    }

    var lang="en";

    switch (hotword){
        case "next":
        case "next song":
        case "play next song":
        case "play next":
            hotword="next";
        break;

        case "previous":
        case "previous song":
        case "play previous song":
        case "play previous":
            hotword="previous";
        break;

        case "japanese raspberry":
        case "ゴジラ":
        case "gojira":
        case "godzilla":
        case "gozila":
        case "drymon":
        case "dry moon":
        case "hey hanako":
        case "hello sakura":
            lang="jp";
        break;
        
        
        case "hey brain boy":
        case "hey snow boy":
        case "hey computer":
        case "hey cranberry":
        case "hey raspberry pi":
        case "hey raspberry":
        case "okay raspberry":
        case "raspberry pi":
        case "snowboy":
        case "brain box":
        case "raspberry":
        break;

        case "turn on the lights":
        case "switch on the lights":
        case "good evening":
            emodules.Bulb.eprocess("lights on");
            return;
        break;

        case "turn off the lights":
        case "switch off the lights":
        case "good night":
            emodules.Bulb.eprocess("lights off");
            return;
        break;

        case "start party time":
        case "start a party":
            emodules.Bulb.eprocess("party manual on");
            return;
        break;

        case "stop the party":
            emodules.Bulb.eprocess("party off");
            return;
        break;


        default: //not trigger word
            return;
    }

    if (hotword=="next"){
        playNext();
        return
    }

    if (hotword=="previous"){
        playPrev();
        return
    }
    if (!isbusy){
        if (hotword=="dingdong"){
            pushNotify("Doorbell!","Doorbell detected.");
            return;
        }
    }

    /*
    if (hotword=="ゴジラ"){
        lang="jp";
    }*/


    if (!isbusy){
        //stopSnowboy();
        forkSpeech({lang:lang});
    }
}

var cleanExit = function() { process.exit() };
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill

function sphinxDetector(){
    //return;//disabled
    console.log("starting pocketsphynx");
    var sphinx = spawn("./sphinxtest.sh");

    sphinx.stdout.on('data', function (data) {
        try {
            var hotwords = data.toString().trim();
            console.log("sphinx hotword:",hotwords);
            hotwords = hotwords.split("  ");
            var hotword = hotwords[hotwords.length-1];
            console.log(hotword);
            if (hotword){
                hotword_detected(hotword.trim().toLowerCase());
            }

        }catch (error){
            console.log("error:"+error);
        }
    });
}



function pushNotify(title,text){
    
    exec("curl -u o.UVKCDG9FQNwvFrGJ0JDfb7lZHXDobE6M: -X POST https://api.pushbullet.com/v2/pushes --header 'Content-Type: application/json' --data-binary '{\"type\": \"note\", \"title\": \""+title+"\", \"body\": \""+text+"\"}'", {stdio:"ignore"} );
    
}

function playNext(){
    chromecast.Next();
}

function playPrev(){
    chromecast.Prev();
}

//console.log(new Date().getHours());
function callActivateOnSilence(){
    //console.log("activated");
    //TODO: add check on hours

    
    var dateObj=new Date();
    var hours=dateObj.getHours();
    var dayOfWeek=dateObj.getDay();
    var cur_time=get_current_time();
    var hourLimit=11;
    //Saturday
    if (dayOfWeek==6){
        hourLimit=10;
    }//dayOfWeek==0 || 
    
    //less than 2 hours since last call. so ignore
    if (lastTimeOnSilentCalled>cur_time-60*60*2){
        return false;
    }



    if (hours>7 && hours<hourLimit){
        lastTimeOnSilentCalled = cur_time;
        console.log("good morning activated");
        goodMorning();
    }

}

function goodMorning(){
    Speaker.Speak("Good morning, do you want me to play music?",function(){
        forkSpeech({
            lang:"en",
            type:"question",
            questionCallback:function(text){
                console.log(text);
                if (text=="yes" || text=="yes yes"){
                    Speaker.Speak("Ok, tell me which music?",function(){
                        forkSpeech({
                            lang:"en",
                            assumeCommand:"play",
                        });
                    });
                }
            }
        });
    });
}


function forkSpeech(info){
    if (!enableWakeupCall){
        return false;
    }
    stopSnowboy();
    isbusy=true;
    console.log(emodules.Bulb.lastBulbOnOff());
    if (emodules && emodules.Bulb.lastBulbOnOff()=="on"){
        Speech.turnOffSound(true);
        emodules.Bulb.eprocess("listen");
    }else{
        Speech.turnOffSound(false);
    }
    Speech.Start(info,process_messages);
}


function get_current_time(){
    var seconds = Math.floor(new Date().getTime() / 1000);
    return seconds;
}


function process_messages(m){
    console.log('Got message:', m);
    if (m.message=="stopped"){
        isbusy=false;
        startSnowboy();
    }
    if (m.recognized){
        Proccessor.Process(m);
    }
}


function stopSnowboy(){
    //record.stop();
    mic.unpipe();
    //goglStream.exit();
    console.log('snowboy stopped');
}

function startSnowboy(){
    if (!mic){
        mic = record.start({
            sampleRate : 16000,
            threshold: 0,
            //band:'135-2k',
            verbose: false
        });
    }
    mic.pipe(detector);

    if (emodules && emodules.Bulb.lastBulbOnOff()=="on"){
        Speech.nosound = true;
        emodules.Bulb.eprocess("last");
    }

    console.log('snowboy started');
}



function callbacksProcessor(args){
    var func=args[0];
    func=parent[log]("tst");
    //func("tst");
    args=Array.prototype.slice.call(args, 1);
    console.log(func,args);
    
}
/*
    Start autoload
*/


emodules = require ("./Modules/Autoinclude")(function(func){
    try {
        return public_functions[func].apply(this,Array.prototype.slice.call(arguments, 1));
    }catch (exception){
        console.log(exception);
    }

});

