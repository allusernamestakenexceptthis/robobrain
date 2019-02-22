//parent=global.__mparent;
module.exports = function (parent){

    var fs = require('fs');
    var record = require('node-record-lpcm16')
    const Proccessor = require(__base+"./Modules/Processor/process.js");
    const Speaker = require(__base+"./Modules/Speaker/speaker.js");
    const Player = require(__base+"./Modules/Player/player.js");

    var recordingDir = __base+"recordings/";

    var therewasSound=false;
    var recordStarted=false;

    var trans={
        'jp':{
            'START_RECORD':'はい、ビィー音あと録音します.',
            'NO_SOUND':'音聞こえなかった',
            'DONE':'終了しました'
        },
        
        'en':{
            'START_RECORD':'Ok will start recording after the beep.',
            'NO_SOUND':'No sound detected',
            'DONE':'Done!'
        }
    }


    function recordWav(for_seconds){
        recordStarted=true;
        therewasSound=false;
        index=1;
        while (fs.existsSync(recordingDir+'record'+index+'.wav')) { 
            index++;
        }
        var waveFile=recordingDir+'record'+index+'.wav';
        console.log(waveFile);

        parent("registerHook","recordWaveSound",{
            module: "snowboy_sound",
            callback: function(res){
                console.log(res);
                therewasSound=true;
            },
            times: 1
        });

        parent("registerHook","recordWaveSilence",{
            module: "snowboy_silence",
            test: { 
                "var":"silenceLength",
                "rule":"=",
                "value":for_seconds
            },
            callback: function(res){
                //record.stop()
                stop_recording(waveFile);
            },
            times: 1
        });

        var file = fs.createWriteStream(waveFile, { encoding: 'binary' });
        record.start({
            sampleRate : 16000,
            threshold: 0.5,
            //verbose : true
        })
        .pipe(file)

        setTimeout(function () {
            stop_recording(waveFile);
        }, for_seconds*1000)
    }

    function stop_recording(waveFile){
        record.stop();
        if (!recordStarted){
            return;
        }
        sucess=true;
        recordStarted=false;
        if (!therewasSound && waveFile){
            if (fs.existsSync(waveFile)){
                fs.unlink(waveFile);
                sucess=false;
            }
        }
        if (sucess){
            Speaker.Speak({text:trans[lang]['DONE'],lang:lang});
            start_record();
        }else{
            Speaker.Speak({text:trans[lang]['NO_SOUND'],lang:lang});
        }

        parent("enableWakeup",true);
    }

    function start_record(text,toDo){
        var for_seconds=5;
        var after_seconds=3;
        Speaker.Speak({text:trans[lang]['START_RECORD'],lang:lang},
            function (){
                    setTimeout(function () {
                    parent("enableWakeup",false);
                    Player.Play(global.__base+'./res/start.mp3',function(){
                        recordWav(for_seconds);
                    });
                    
                    }, after_seconds*1000)
            }
        );
    }

    Proccessor.RegisterHooks({"record":{'type':"callback",'lang':"en",'callback':function(text,toDo){
            console.log(text);
            //ToDo add exact timing like for 3 seconds after 5 seconds.
            start_record(text,toDo);


        }}
    });
    //recordWav();
}