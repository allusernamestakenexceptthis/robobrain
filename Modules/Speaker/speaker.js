const CONFIG = require(__base+'./Configs/config.js');
// Load the SDK
const AWS = require('aws-sdk')
const fs = require('fs')
AWS.config.loadFromPath(CONFIG.AWS_KEY);

const Player = require("../Player/player.js");

// Create an Polly client
const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'us-east-1'
})


TEMP_DIR="tmp/";
var _hash = require('crypto-toolkit').Hash('hex');


function Speak(ModuleParams,callback){
    if (ModuleParams === null){
        return false;
    }
    if (typeof ModuleParams === "string"){
        ModuleParams={
            "text":ModuleParams
        }
    }

    var text = ModuleParams["text"]
    var mode = ModuleParams["mode"]
    var lang = ModuleParams["lang"]

    if (mode=="print"){
        console.log(text);
        if (callback){
            callback();
        }
        return;
    }

    var lang_speaker="Kendra";
    if (lang && lang=="jp"){
        lang_speaker="Mizuki";
    }

    if (mode == "speaker" || !mode){

        if (text.length>300){
            text=text.substr(0,300);
        }
        var textHash = _hash.sha256(text);

        if (fs.existsSync(TEMP_DIR+textHash+'.mp3')) {
            Player.Play(TEMP_DIR+textHash+'.mp3',callback);
        }else{
            let params = {
                'Text': text,
                'OutputFormat': 'mp3',
                'VoiceId': lang_speaker
            }

            Polly.synthesizeSpeech(params, (err, data) => {
                if (err) {
                    console.log(err.code)
                } else if (data) {
                    if (data.AudioStream instanceof Buffer) {
                        fs.writeFile(TEMP_DIR+textHash+'.mp3', data.AudioStream, function(err) {
                            if (err) {
                                return console.log(err)
                            }
                            if (fs.existsSync(TEMP_DIR+textHash+'.mp3')) {
                                Player.Play(TEMP_DIR+textHash+'.mp3',callback);
                                
                            }
                        })
                    }
                }
            })
        }
    }
}





/* Expose Module */
module.exports.Speak = Speak;