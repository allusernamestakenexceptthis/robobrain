
//Paths
path = __dirname + '/../'; //leave this
global.__base = path; //leave this


//API Keys
define("GOOD_SPEECH_KEY", path+"../.secret/speech-a14db5f21c06.json");
define("AWS_KEY", "/home/pi/.awsconfig");
define('YOUTUBE_MUSIC_FETCHING_URL', "https://www.example.com/getyoutube/?text=");


function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true,
        writable:false
    });
}
