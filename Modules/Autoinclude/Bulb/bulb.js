//parent=global.__mparent;
module.exports = function (parent){

    var peripheralId = "676f94920976";
    var writeUID = "a040";
    var indicateUID = "a042";
    var readUID = "a041";

    var lat = 35.230372,
        long = 139.211197;

    var fs = require('fs');
    var async = require('async');
    var SunCalc = require('suncalc');
    var lightCharacterstic = "";
    var readCharacterstic = "";
    var sunTimes = "";
    var lastColor = "blue";
    var lastCheck = 0;
    var lastBulbOnOff = "on";
    var lang = "";
    var lastBulbRead = "";
    const Proccessor = require(__base+"./Modules/Processor/process.js");
    const Speaker = require(__base+"./Modules/Speaker/speaker.js");
    const Player = require(__base+"./Modules/Player/player.js");


    var trans={
        'jp':{
            'dontunderstand':'すみません、わかりません.',
            'DONE':'終了しました'
        },
        
        'en':{
            'dontunderstand':"Sorry, I don't understand.",
            'DONE':'Done!'
        }
    }

    //test light

var noble = require('noble');
var serviceUUIDs = ["0000a032-0000-1000-8000-00805f9b34fb"]; // default: [] => all
var allowDuplicates = true; // default: false

//a032
noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
      noble.startScanning();
    } else {
      noble.stopScanning();
    }
  });
  
  noble.on('discover', function(peripheral) {
      if (peripheral.id === peripheralId){
        noble.stopScanning();
        console.log('Found device with local name: ' + peripheral.advertisement.localName);
        console.log('advertising the following service uuid\'s: ' + peripheral.advertisement.serviceUuids);
        console.log('peripheral with ID ' + peripheral.id + ' found');
        console.log();
        explore(peripheral);
      }
      //
  });

  function test(){
      console.log("tested");
  }

    function startBulbTimeCheck(){
        setTimeout(function(){
            var dateObj=new Date();
            var hours=dateObj.getHours();
            var minutes = dateObj.getMinutes();
            //console.log(hours);
            var curtime=get_current_time();
            if (!sunTimes || lastCheck>curtime-60*60*24){
                sunTimes = SunCalc.getTimes(new Date(), lat, long);
            }

            sunriseHour = 0;
            sunriseMinutes = 30;

            sunsetHour = sunTimes.sunset.getHours();
            sunsetMinutes = 0;

            changeState = "";
            if (hours==sunriseHour && minutes>=sunriseMinutes && minutes<=sunriseMinutes+5){
                changeState="off";
            }else if(hours==sunsetHour && minutes>=sunsetMinutes && minutes<=sunsetMinutes+10){
                changeState="on";
            }

            if (changeState && changeState!=lastBulbOnOff){
                console.log(changeState);
                sendLightCommand(changeState);
            }

            startBulbTimeCheck();
        },5000);
    }
    
    function getBulbStatus(){
        return lastBulbOnOff;
    }

    function get_current_time(){
        var seconds = Math.floor(new Date().getTime() / 1000);
        return seconds;
    }

    function explore(peripheral) {
        console.log('services and characteristics:');
        peripheral.connect(function(error) {
            peripheral.discoverServices([], function(error, services) {
            var serviceIndex = 0;

            async.whilst(
                function () {
                return (serviceIndex < services.length);
                },
                function(callback) {
                var service = services[serviceIndex];
                var serviceInfo = service.uuid;

                if (service.name) {
                    serviceInfo += ' (' + service.name + ')';
                }
                console.log(serviceInfo);
                service.discoverCharacteristics([], function(error, characteristics) {
                    var characteristicIndex = 0;

                    async.whilst(
                    function () {
                        return (characteristicIndex < characteristics.length);
                    },
                    function(callback) {
                        var characteristic = characteristics[characteristicIndex];
                        var characteristicInfo = '  ' + characteristic.uuid;

                        if (characteristic.uuid == indicateUID){
                            console.log("indicate uuid subscribe and notify")
                            characteristic.subscribe(function (error){
                                    console.log(error);
                                    readCharacterstic.read(function (error, data) {console.log(data.toString('hex'));});
                                }
                            );

                            characteristic.discoverDescriptors(function(error, descriptors){
                                console.log(descriptors[0].name);
                                
                                descriptors[0].writeValue(new Buffer("0100", 'hex'), function(error){
                                    console.log(error);
                                    console.log("finished");
                                    descriptors[0].readValue(function(error, data){
                                        console.log(error);
                                        console.log(data);
                                    });
                                
                                    sendLightCommand("check",function(){
                                        readCharacterstic.read(function (error, data) {
                                        
                                            console.log(data.toString('hex'));
                                            var hexData = data.toString('hex');
                                            lastBulbRead = data;
                                            if (data[14]==0x28 || (data[5]==0x00 && data[6]==0x00 && data[7]==0x00)){
                                                console.log("light is OFF");
                                                lastBulbOnOff = "off";
                                            }else{
                                                console.log("light is ON");
                                                lastBulbOnOff = "on";
                                            }

                                        });
                                    });
                                });
                            });
                        }

                        if (characteristic.uuid===writeUID){
                            console.log(characteristic.uuid);
                            lightCharacterstic  = characteristic;
                            
                            startBulbTimeCheck();
                        }

                        if (characteristic.uuid===readUID){
                            readCharacterstic  = characteristic;
                        }


                        if (characteristic.name) {
                        characteristicInfo += ' (' + characteristic.name + ')';
                        }

                        async.series([
                        function(callback) {
                                characteristicInfo += '\n    properties  ' + characteristic.properties.join(', ');

                            if (characteristic.properties.indexOf('read') !== -1) {
                            characteristic.read(function(error, data) {
                                if (data) {
                                var string = data.toString('ascii');

                                characteristicInfo += '\n    value       ' + data.toString('hex') + ' | \'' + string + '\'';
                                }
                                callback();
                            });
                            } else {
                            callback();
                            }
                        },
                        function() {
                            console.log(characteristicInfo);
                            characteristicIndex++;
                            callback();
                        }
                        ]);
                    },
                    function(error) {
                        serviceIndex++;
                        callback();
                        console.log(error);
                    }
                    );
                });
                },
                function (err) {
                    console.log(err);
                }
            );
            });
        });
    }

    var lightColors={
        'blue':"0000ff",
        "skyblue":"00ffff",
        "red":"ff0000",
        "green":"00ff00",
        'yellow':"ffd800",
        'pink':"e800ff",
        'orange':"ffa900"

    };

    var lightColorsWords = {
        'en':{
            'blue':"blue",
            'red':"red",
            'sky blue':"skyblue",
            'green':"green",
            'pink':"pink",
            'orange':"orange",
            'yellow':"yellow"
        }
    }

    function eprocess(message){
        textProccessor (message);
    }

    function textProccessor(text,toDo){
        console.log(text);


        var onWords = [
                "lights on","on light","on the light","light on",
                "オン","付けて","点けて","つけて","着けて"
                    ];

        var offWords = [
            "lights off","off lights","off the light","light off",
            "オフ","けして","消して"
            ];
        
        var partyOnWords = [
            "party on","party start","party manual on"
                ];

        var partyOffWords = [
            "party off","party stop"
                ];

        if (detectedWord = doesContain(text,partyOnWords)){
            if (lastBulbOnOff=="on" || detectedWord!="party manual on"){
                return startTransition();
            }
            return;
        }

        if (detectedWord = doesContain(text,partyOffWords)){
            return stopParty();
        }
            
        var colorWOrds = Object.keys(lightColorsWords['en']);
        var detectedWord = "";
        if (text=="listen"){
            sendLightCommand(text);
        }else if (detectedWord = doesContain(text,colorWOrds)){
            sendLightCommand(lightColorsWords['en'][detectedWord]);
        }else if (text=="last"){
            if (lastColor.indexOf("#")!=-1 || lightColors[lastColor]){
                sendLightCommand(lastColor);
            }
        }else if (doesContain(text,onWords)){
            sendLightCommand("on");
        }else if (doesContain(text,offWords)){
            sendLightCommand("off");
        }
    }

    function doesContain(text,words){
        var res = false;
        words.forEach(function(word){
            //console.log(word);
            if (text.indexOf(word)!=-1){
                res = word;
            }
        });
        return res;
    }

    function getHexArray(hexVal) {
        
        return hexVal.toLowerCase().match(/[0-9a-f]{2}/g);
    
    }

    function sendLightCommand(command,callback){
        if (!lightCharacterstic){
            console.log("light not found");
            return false;
        }
        var hexCommand = "55aa";
        var extra = "";
        switch (command){
            case "off":
                extra+="01080500f2";
                lastBulbOnOff="off";
            break;
            case "on":
                if (lightColors[lastColor]){
                    command=lastColor;
                }else{
                    extra+="03080200fffff5";
                }
                lastBulbOnOff="on";
            break;
            case "check":
                extra+="01081506dc";
            break;
            //55:aa:03:08:02:ff:00:ff:f5 color,  4 blue side only, 5 red blue, 6 all 3.
        }


        if (!extra && lightColors[command] || command=="listen" || command.indexOf("#")!=-1){
            if (command=="listen"){
                command="red";
            }else{
                lastColor = command;
            }

            if (command.indexOf("#")!=-1){
                extra+="030802"+command.replace("#","");
            }else{
                extra+="030802"+lightColors[command];
            }
            hexCommand+=extra;
            var hexArr = getHexArray(hexCommand);

            var sum = 0;
            hexArr.map(function(v){
                sum+=parseInt(v,16);
            });
            var lastByte = ((~sum  & parseInt(0xff))).toString(16);
            if (lastByte.length==1){
                lastByte="0"+lastByte;
            }
            hexCommand+=lastByte;
            lastBulbOnOff="on";
        }else{
            hexCommand+=extra;
        }

        if (!extra){
            Speaker.Speak({text:trans[lang]['dontunderstand'],lang:lang});
            return false;
        }
        
        if (!partyOn){
            console.log(hexCommand);
        }
        try {
            lightCharacterstic.write(new Buffer(hexCommand, 'hex'), false, function(error) {
                if (!partyOn){
                    console.log('send command: ');
                    console.log(hexCommand);
                    console.log();
                }
                if (callback){
                    callback();
                }
            });
        }catch (e){
            console.log("error occured in light command");
        }
    }



    //based on stackoverflow akinuri answer:
    // https://stackoverflow.com/a/19657772/766985

    /* ==================== Required Functions ==================== */
    // This is required to get the initial background-color of an element.
    // The element might have it's bg-color already set before the transition.
    // Transition should continue/start from this color.
    // This will be used only once.
    function getElementBG() {
        var bg="";
        if (lightColors[lastColor]){
            bg = lightColors[lastColor];
        }else{
            bg = lightColors['blue'];
        }
        match = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(bg);
        bg = [
            parseInt(match[1],16),
            parseInt(match[2],16),
            parseInt(match[3],16)
        ];
        return bg;
    }

    // A function to generate random numbers.
    // Will be needed to generate random RGB value between 0-255.
    function random() {
        if (arguments.length > 2) {
            return 0;
        }
        switch (arguments.length) {
            case 0:
                return Math.random();
            case 1:
                return Math.round(Math.random() * arguments[0]);
            case 2:
                var min = arguments[0];
                var max = arguments[1];
                return Math.round(Math.random() * (max - min) + min);
        }
    }

    // Generates a random RGB value.
    function generateRGB(min, max) {
        var min		= min || 0;
        var max		= min || 255;
        var color	= [];
        for (var i = 0; i < 3; i++) {
            var num = random(min, max);
            color.push(num);
        }
        return color;
    }

    // Calculates the distance between the RGB values.
    // We need to know the distance between two colors
    // so that we can calculate the increment values for R, G, and B.
    function calculateDistance(colorArray1, colorArray2) {
        var distance = [];
        for (var i = 0; i < colorArray1.length; i++) {
            distance.push(Math.abs(colorArray1[i] - colorArray2[i]));
        }
        return distance;
    }

    // Calculates the increment values for R, G, and B using distance, fps, and duration.
    // This calculation can be made in many different ways.
    function calculateIncrement(distanceArray, fps, duration) {
        var fps			= fps || 30;
        var duration	= duration || 1;
        var increment	= [];
        for (var i = 0; i < distanceArray.length; i++) {
            var incr = Math.abs(Math.floor(distanceArray[i] / (fps * duration)));
            if (incr == 0) {
                incr = 1;
            }
            increment.push(incr);
        }
        return increment;
    }

    // Converts RGB array [32,64,128] to HEX string #204080
    // It's easier to apply HEX color than RGB color.
    function rgb2hex(colorArray) {
        var color = [];
        for (var i = 0; i < colorArray.length; i++) {
            var hex = colorArray[i].toString(16);
            if (hex.length < 2) { hex = "0" + hex; }
            color.push(hex);
        }
        return color.join("");
    }

    /* ==================== Setup ==================== */
    // Duration is not what it says. It's a multiplier in the calculateIncrement() function.
    // duration = 1-4, fast-to-slow
    var fps				= 80;
    var duration		= 1;
    var currentColor	= getElementBG();
    var transHandler	= null;
    var partyOn = false;


    //startTransition();

    function stopParty(){
        clearInterval(transHandler);
    }

    /* ==================== Transition Initiator ==================== */
    function startTransition() {
        //return ;//disabled

        clearInterval(transHandler);
        partyOn = true;
        
        targetColor	= generateRGB();
        distance	= calculateDistance(currentColor, targetColor);
        increment	= calculateIncrement(distance, fps, duration);

        transHandler = setInterval(function() {
            if (partyOn){
                transition();
            }else{
                clearInterval(transHandler);
            }
        }, 1000);
    }

    /* ==================== Transition Calculator ==================== */
    function transition() {
        if (!partyOn){
            return;
        }
        // checking R
        if (currentColor[0] > targetColor[0]) {
            currentColor[0] -= increment[0];
            if (currentColor[0] <= targetColor[0]) {
                increment[0] = 0;
            }
        } else {
            currentColor[0] += increment[0];
            if (currentColor[0] >= targetColor[0]) {
                increment[0] = 0;
            }
        }
        
        // checking G
        if (currentColor[1] > targetColor[1]) {
            currentColor[1] -= increment[1];
            if (currentColor[1] <= targetColor[1]) {
                increment[1] = 0;
            }
        } else {
            currentColor[1] += increment[1];
            if (currentColor[1] >= targetColor[1]) {
                increment[1] = 0;
            }
        }
        
        // checking B
        if (currentColor[2] > targetColor[2]) {
            currentColor[2] -= increment[2];
            if (currentColor[2] <= targetColor[2]) {
                increment[2] = 0;
            }
        } else {
            currentColor[2] += increment[2];
            if (currentColor[2] >= targetColor[2]) {
                increment[2] = 0;
            }
        }
        
        // applying the new modified color
        //transElement.style.backgroundColor = rgb2hex(currentColor);
        currentColor = targetColor;
        sendLightCommand("#"+rgb2hex(currentColor),function(){
            startTransition();
        });

    }





    Proccessor.RegisterHooks({"turn":{'type':"callback",'lang':"en",'callback':function(text,toDo){
            console.log(text);
            lang="en";
            textProccessor(text,toDo);
        }}
    });

    Proccessor.RegisterHooks({"party":{'type':"callback",'lang':"en",'callback':function(text,toDo){
            console.log(text);
            lang="en";
            textProccessor("party "+text,toDo);
        }}
    });

    Proccessor.RegisterHooks({"change":{'type':"callback",'lang':"en",'callback':function(text,toDo){
            console.log(text);
            lang="en";
            textProccessor(text,toDo);
        }}
    });

    Proccessor.RegisterHooks({"電気":{'type':"callback",'lang':"jp",'callback':function(text,toDo){
            console.log(text);
            lang="jp";
            textProccessor(text,toDo);
        }}
    });

    Proccessor.RegisterHooks({"ライト":{'type':"callback",'lang':"jp",'callback':function(text,toDo){
        console.log(text);
        lang="jp";
        textProccessor(text,toDo);
    }}
});
    //recordWav();
    //expose external processor to process messages from outside the module.
    module.exports.eprocess = eprocess;
    module.exports.lastBulbOnOff = getBulbStatus;
    return module.exports;
}