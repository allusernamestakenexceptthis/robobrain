
const exec = require('child_process').exec;


function Play(file,callback){
    
    //if callback is actually string = noconflict then don't play this unimportant sound if busy.
    if (callback=="noconflict"){
        if (Play.isPlaying){
            return;
        }
        callback=null;
    }

    Play.isPlaying=true;
    proc=exec('mpg123 '+file, {stdio:"ignore"} );
    
    proc.on('exit', function() {
        if (callback){
            callback();
            Play.isPlaying=false;
        }
    });
    
}

/* Expose Module */
module.exports.Play = Play;