var Client                = require('castv2-client').Client;
var DefaultMediaReceiver  = require('castv2-client').DefaultMediaReceiver;
var Youtube               = require('castv2-youtube').Youtube;
var Braincast              = require(__base+'./Modules/Chromecast/braincast.js');
var mdns                  = require('mdns');
var util                  = require('util');
var Application           = require('castv2-client/lib/senders/application');
const exec                = require('child_process').exec;
var chromeHost = null;
var sequence = [
  mdns.rst.DNSServiceResolve(),
  'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({families:[4]}),
  mdns.rst.makeAddressesUnique()
];






function findChromecast(callback){
    if (chromeHost){
        return callback(chromeHost);
    }

    var browser = mdns.createBrowser(mdns.tcp('googlecast'), {resolverSequence: sequence});
    browser.on('serviceUp', function(service) {
        if (service.name.indexOf("Chromecast")!=-1){
            console.log('found device "%s" at %s:%d', service.name, service.addresses[0], service.port);
            //ondeviceup(service.addresses[0]);
            chromeHost=service.addresses[0];
            browser.stop();
            if (callback){
                callback(chromeHost);
            }
            
        }
        
    });
    browser.start();
}


function waitFor(emitter, event, timeout, fn) {
  var called = false, handler, timer;

  handler = function() {
    called = true;
    clearTimeout(timer);
    fn.apply(this, arguments);
  }

  var timer = setTimeout(function() {
    emitter.removeListener(handler);
    if (! called) return fn("TIMEOUT");
  }, timeout);

  emitter.once(event, handler);
}


function PlayYoutube(videoRaw){
    if (!videoRaw)return false;
    //to do add list to items split by ;; and iterate.
    /*
    exec("youtube-dl -g "+video, function(error, stdout, stderr){
         //callback(stdout); 
         console.log(stdout);
    });*/
    //Next();
    listId="";
    videoUrl=videoRaw.split("&list=");
    video=videoUrl[0];
    console.log(videoUrl);
    if (videoUrl[1]){
        listId=videoUrl[1];
    }
    PlayYoutubeInternal(video,listId);
}


function PlayYoutubeInternal(video,listId){
    require('child_process').exec("cecctvon.sh", {stdio:"ignore"} );

    connect(null,function(err,client){
        client.launch(Braincast, function(err, player) {
            console.log(err,player);
                var media = {
                    contentId:video,
                    contentType: 'video/mp4',
                    streamType: 'BUFFERED', // or LIVE BUFFERED
                    'action':"load",
                    'listId':listId,
                    'host':"youtube",
                    
                    metadata: {
                        type: 0,
                        metadataType: 0,
                        title: "Youtoob", 
                        images: [
                            { url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg' }
                        ]
                    }      
                };

                player.on('status', function(status) {
                    //console.log(status,status.idleReason);
                    //console.log('status broadcast playerState=%s', status.playerState);
                    //if (status.idleReason=="FINISHED"){
                      //  PlayYoutube("https://r2---sn-ogueln76.googlevideo.com/videoplayback?itag=22&mm=31&ipbits=0&mn=sn-ogueln76&source=youtube&mv=m&mime=video%2Fmp4&ms=au&dur=230.667&initcwndbps=1547500&id=o-AEwWRdntjBma-iXiT-90MQfpVYA0dhTM_RMuEi5aZr8Z&pl=22&ratebypass=yes&ip=153.226.87.64&sparams=dur%2Cei%2Cid%2Cinitcwndbps%2Cip%2Cipbits%2Citag%2Clmt%2Cmime%2Cmm%2Cmn%2Cms%2Cmv%2Cpl%2Cratebypass%2Crequiressl%2Csource%2Cupn%2Cexpire&requiressl=yes&key=yt6&upn=WKJ447oh9_Q&ei=OprWWO-6PISa4ALx-6zIAg&mt=1490459070&lmt=1478830549413729&expire=1490480795&signature=C101C34FD54FF72F71D49315851FB69A2B705969.08ABA8D259F7CD7EA2B5B255AE69011A78D9BEA1");
                    //}
                });

                console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId);

                player.load(media, { autoplay: true }, function(err, status) {
                    console.log(status);
                });
        });

        /*
        console.log("called");
        if (err){
            console.log(err);
            return;
        }
        */
    });
}

function Next(){
    connect("YouTube,Braincast",function(err,client,player){
        console.log("called");
        if (err){
            console.log(err);
            return;
        }
        //console.log(player);
        
        
        if (player){
            console.log(player);
            if (player.type=="Braincast"){
                player.next();
            }else{
                player.seek(9999);
            }
            
        }
    });
}

function Prev(){
    connect("YouTube,Braincast",function(err,client,player){
        console.log("called");
        if (err){
            console.log(err);
            return;
        }
        //console.log(player);
        
        
        if (player){
            if (player.type=="Braincast"){
                player.prev();
            }else{
                player.seek(0);
            }
            
        }
    });
}


function Stop(){
    connect("YouTube,Braincast",function(err,client,player){
        console.log("called");
        if (err){
            console.log(err);
            return;
        }
        //console.log(player);
        
        
        if (player){
            player.stop();
        }
    });
}

function connect(targetApp,callback){
    findChromecast(
        function(host){
            var client = new Client();

            client.connect(host, function() {
                console.log('connected, launching app ...');
                if (!targetApp){
                    if (callback){
                        callback(null,client);
                    }
                    return;
                }
                
                client.getStatus(function(err, status) {
                    if(!err) {
                        var app = (status && status.applications && status.applications[0]) || {};

                        client.getSessions(function(err,sessions){
                            //console.log("test",err,sessions);
                            var session = sessions[0];
                            if (!session){
                                if (callback){
                                    callback("no session found");
                                }
                                return;
                            }
                            console.log(session.namespaces);
                            //if (session.displayName!=targetApp){
                            if( !targetApp.match(new RegExp("(?:^|,)"+session.displayName+"(?:,|$)"))) {
                                if (callback){
                                    callback("target app "+targetApp+" was not found");
                                }
                                return;
                            }
                            var receiver=null;
                            if (session.displayName=="Braincast"){
                                receiver=Braincast;
                            }else if (session.displayName=="AutoCast Screen"){
                                receiver=DefaultMediaReceiver;
                            }else{
                                receiver=DefaultMediaReceiver
                            }
                            //console.log(receiver);
                            //console.log(session,app.appId);
                            client.join(session,receiver,function(err,player){
                                //console.log(player);
                                //console.log(player.media.channel);
                                console.log("joined");
                                //player.pause();
                                player.type=session.displayName;
                                if (session.displayName=="AutoCast Screen"){
                                    setTimeout(function(){callback(null,client,player);},2000);
                                }
                                
                                if (session.displayName=="Braincast"){
                                    setTimeout(function(){callback(null,client,player);},200);
                                }
                                player.getStatus(function(err,status){
                                    console.log(err,status);
                                    if (status){
                                        if (callback){
                                            callback(null,client,player);
                                        }
  
                                    }else{
                                        if (callback){
                                            callback("null status");
                                        }
                                    }
                                });
                            });
                        });

                    }
                });

            


                /*
                client.launch(DefaultMediaReceiver, function(err, player) {
                var media = {

                    // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
                    contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
                    contentType: 'video/mp4',
                    streamType: 'BUFFERED', // or LIVE

                    // Title and cover displayed while buffering
                    metadata: {
                    type: 0,
                    metadataType: 0,
                    title: "Big Buck Bunny", 
                    images: [
                        { url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg' }
                    ]
                    }        
                };

                player.on('status', function(status) {
                    console.log('status broadcast playerState=%s', status.playerState);
                });

                console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId);

                player.load(media, { autoplay: true }, function(err, status) {
                    console.log('media loaded playerState=%s', status.playerState);

                    // Seek to 2 minutes after 15 seconds playing.
                    setTimeout(function() {
                    player.seek(2*60, function(err, status) {
                        //
                    });
                    }, 15000);

                });

                });*/
                
            });

            client.on('error', function(err) {
                console.log('Error: %s', err.message);
                client.close();
            });
        }
    );
}

function ondeviceup(host) {



}

/* Expose Module */
module.exports.Next = Next;
module.exports.Prev = Prev;
module.exports.Stop = Stop;
module.exports.PlayYoutube = PlayYoutube;
