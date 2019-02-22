
const CONFIG = require(__base+'./Configs/config.js');
const Player = require("../Player/player.js");
const goglRecord = require(__base+'./Modules/Recorder/record.js');;
const path = require('path');
const fs = require('fs');

var noSound = false;

var isGoogleStarted=false;
var goglStream = null;

var messageCallback = null;

const Speech = require('@google-cloud/speech');

const speechClient = new Speech.SpeechClient({
  projectId:  "speech-160702",
  keyFilename:  CONFIG.GOOD_SPEECH_KEY
});

var goglmic = null;

function turnOffSound(state){
    noSound = state;
}

function playStart(){
    if (!noSound){
        Player.Play('./res/start.mp3');
    }
}

function playStop(){
    //console.log("play stop sound");
    //Player.Play('./res/stop.mp3',"noconflict");
}

function Start(info,callback){
    messageCallback=callback;
    startListener(info);
}



function startListener(info){
    if (isGoogleStarted){
        return;
    }
    isGoogleStarted=true;
    //stopSnowboy();
    listenToGoogle(info);
    setTimeout(function(){
        playStart();
    },200);
    setTimeout(function(){
        stopGoogle();
    },6000);

}


function stopGoogle(){
    if (!isGoogleStarted){
        return;
    }
    isGoogleStarted=false;
    
    //mic.unpipe();
    goglmic.unpipe();
    goglStream.end();
    goglRecord.stop();
    
    //delete goglStream;
    playStop();
    //console.log('stopped');
    if (messageCallback){
        messageCallback({ message: 'stopped' });
    }
    /*
    setTimeout(function(){
        process.exit();
    },1000);*/
}




function listenToGoogle(info){
    var configLang="en-US";
    var lang=info.lang;
    if (lang=="jp"){
        configLang="ja-JP";
    }
    goglmic=goglRecord.start({
        sampleRateHertz : 16000,
        //band:'135-1k',
        threshold: 0
    });


// Detect the speech in an audio file stream. 
    goglStream=speechClient.streamingRecognize({
            config: {
                encoding: 'LINEAR16',
                sampleRateHertz: 16000,
                maxAlternatives: 30,
                languageCode: configLang,
		alternativeLanguageCodes: [`ja-JP`, `en-US`],
            },
            singleUtterance: true,
            interimResults: false,
            verbose: true
        })
        .on('error', console.error)
        .on('data', function(recognizeResponse) {
            //console.log(recognizeResponse);
            //this.emit( "end" );
            if (recognizeResponse.results && recognizeResponse.results.length){
                var recognizedText=JSON.stringify(recognizeResponse.results, null, 2);
                if (recognizedText && recognizeResponse.results[0].isFinal){
                    console.log(recognizeResponse.results[0].alternatives[0].transcript);
                    //Proccessor.Process(recognizeResponse.results[0]);
                    //process.exit(1);
                    //Speaker.Speak(recognizedText.transcript);
                    stopGoogle();
                    if (messageCallback){
                        messageCallback({ lang:lang,info:info,recognized: recognizeResponse.results[0].alternatives[0]});
                    }
                }
            }
 
            //console.log(recognizeResponse);
        });


    goglmic.pipe(goglStream);//.on('finish', function () { console.log("finished p") });;//.on('error', console.error);
}

/* Expose Module */
module.exports.Start = Start;
module.exports.turnOffSound = turnOffSound;
