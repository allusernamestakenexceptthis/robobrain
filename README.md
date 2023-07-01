# robobrain

A diy AI speaker for raspberry pi. this is an outdated project. it uses snowboy as wakeup word, google speech recognition and amazon polly.  

For youtube control it uses a custom braincast. this is unavailable for public and must be disabled or replaced with your own custom implementation

THIS WON'T WORK RIGHT AWAY, YOU NEED TO HAVE PROGRAMMING EXPERIENCE TO BE ABLE TO MODIFY IT AND RUN. SOMETHING ARE TOO SPECIFIC FOR MY USE CASE
I WON'T BE ABLE TO PROVIDE HELP.

This controls a chromecast device, a bulb, responds to simple commands.  It used to give answers to questions based on api.ai but this service
was shutdown and replaced with google dialogflow. The replacement isn't implemented.

Things it does: controling a chromecast, controling a generic bluetooth bulb, processing queues, using snowboy wake up word, ready for custom modules.
It switches light off/on based on time

I wrote this as a hobby while learning node.js and learning about different apis documentations. it's not optimal. but it worked at a time when
alexa and google home were not available in Japan

Google secrets and amazon aws keys must be stored one directory above root. check config.js and replace accordingly if your setup different

../.secret/speech-a14db5f21c06.json
/home/pi/.awsconfig

You also need to create code to fetch youtube video urls based on search using query string text, then returns the first video: YOUTUBE_MUSIC_FETCHING_URL

install node

sudo apt-get install libavahi-compat-libdnssd-dev
sudo apt-get install lame

npm install
