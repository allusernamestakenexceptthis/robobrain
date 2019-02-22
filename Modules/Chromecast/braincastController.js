var util                      = require('util');
var castv2Cli                 = require('castv2-client');
var RequestResponseController = castv2Cli.RequestResponseController;

function BraincastController(client, sourceId, destinationId) {
  RequestResponseController.call(this, client, sourceId, destinationId, 'urn:x-cast:com.gomilkyway.braincast.message');
  this.once('close', onclose);
  var self = this;
  function onclose() {
    self.stop();
  }
}

util.inherits(BraincastController, RequestResponseController);

BraincastController.prototype.load = function(media,options,callback) {
  if(typeof options === 'function' || typeof options === 'undefined') {
    callback = options;
    options = {};
  }

  var data = { type: 'LOAD'
    ,'action':"load",
    'videoId':media.contentId,
    'listId':media.listId,
    'host':"youtube"

  }



  data.autoplay = (typeof options.autoplay !== 'undefined')
    ? options.autoplay
    : false;

  data.currentTime = (typeof options.currentTime !== 'undefined')
    ? options.currentTime
    : 0;

  data.activeTrackIds = (typeof options.activeTrackIds !== 'undefined')
    ? options.activeTrackIds
    : [];

  data.repeatMode = (typeof options.repeatMode === "string" && 
    typeof options.repeatMode !== 'undefined')
    ? options.repeatMode
    : "REPEAT_OFF";
    
  data.media = media;

  console.log(data);

  this.request(data, function(err, response) {
    console.log(data,response,err);
    if(err) return callback(err);
    if(response.type === 'LOAD_FAILED') {
      return callback(new Error('Load failed'));
    }
    if(response.type === 'LOAD_CANCELLED') {
      return callback(new Error('Load cancelled'));
    }
    var status = response.status[0];
    callback(null, status);
  });
};

BraincastController.prototype.next = function(callback) {
   this.sendAction('next',callback);
}

BraincastController.prototype.prev = function(callback) {
   this.sendAction('prev',callback);
}

BraincastController.prototype.stop = function(callback) {
   this.sendAction('stop',callback);
}

BraincastController.prototype.pause = function(callback) {
   this.sendAction('pause',callback);
}

BraincastController.prototype.play = function(callback) {
   this.sendAction('play',callback);
}

BraincastController.prototype.sendAction = function(action,callback){
   var data = {"action":action}; 
   console.log(data);
   this.request(data, function(err, response) {
     console.log(response);
      if (callback){
        if(err) return callback(err);
        
        var status = response.status[0];
        callback(null, status);
      }
   });
}


module.exports = BraincastController;
