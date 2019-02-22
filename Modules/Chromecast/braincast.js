var util              = require('util');
var castv2Cli         = require('castv2-client');
var Application       = castv2Cli.Application;
var MediaController   = castv2Cli.MediaController;

/*
var Application = require('castv2-client/lib/senders/application');
var MediaController = require('castv2-client/lib/controllers/media');
*/
var BraincastController = require('./braincastController');



function Braincast(client, session) {
  Application.apply(this, arguments);

  this.media = this.createController(MediaController);
  this.braincast = this.createController(BraincastController);

  //this.media.on('status', onstatus);
  this.media.on('status', onstatus);
  this.braincast.on('status', onstatus);
  var self = this;

  function onstatus(status) {
    self.emit('status', status);
  }

}
Braincast.APP_ID = 'AFA6686D';// 


util.inherits(Braincast, Application);

Braincast.prototype.getStatus = function(callback) {
  this.media.getStatus.apply(this.media, arguments);
};

Braincast.prototype.load = function(media, options, callback) {
  this.braincast.load.apply(this.braincast, arguments);
};

Braincast.prototype.play = function(callback) {
  this.braincast.play.apply(this.braincast, arguments);
};

Braincast.prototype.pause = function(callback) {
  this.braincast.pause.apply(this.braincast, arguments);
};

Braincast.prototype.stop = function(callback) {
  this.braincast.stop.apply(this.braincast, arguments);
};

Braincast.prototype.seek = function(currentTime, callback) {
  this.braincast.seek.apply(this.braincast, arguments);
};

Braincast.prototype.next = function(callback) {
  this.braincast.next.apply(this.braincast, arguments);
};

Braincast.prototype.prev = function(callback) {
  this.braincast.prev.apply(this.braincast, arguments);
};

module.exports = Braincast;
