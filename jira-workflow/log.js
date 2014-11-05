var Config = require('./config');

var logLevels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

var logColors = {
  info: 'green',
  debug: 'cyan',
  warn: 'yellow',
  error: 'red'
};

exports.init = function() {
  var winston = require('winston');
  var transports = [];
  if (Config.log.console.enable) {
    var item = new (winston.transports.Console)({
      level: Config.log.console.level,
      colorize: true,
      prettyPrint: true,
      timestamp: true
    });
    transports.push(item);
  }

  if (Config.log.file.enable) {
    var item = new (winston.transports.File)({
      level: Config.log.file.level,
      filename: Config.log.file.path,
      timestamp: true
    });
    transports.push(item);
  }

  if (Config.log.hipchat.enable) {
    var hipchatter = require('hipchatter');
    var hipchat = new hipchatter(Config.log.hipchat.token);

    // custom transport for hipchat based on hipchatter module
    var util = require('util');

    var hipchatLogger = winston.transports.Hipchat = function (options) {
      this.name = 'hipchatLogger';
      this.level = options.level || 'info';
      this.token = options.token;
      this.room = options.room;
      this.format = options.format || 'text';
    };
    util.inherits(hipchatLogger, winston.Transport);

    hipchatLogger.prototype.log = function (level, msg, meta, callback) {
      // this will list all of your rooms
      hipchat.notify(
        this.room,
        {
          message: 'middleware: ' + msg,
          token: this.token,
          color: logColors[level] == 'cyan'? 'purple' : logColors[level] // mismatch between winston and hipchat color
        },
        function(hipchatResponse){
          if (hipchatResponse != null)
            console.log(hipchatResponse);
        });

      callback(null, true);
    };

    // add custom transport to winston
    var item = new (winston.transports.Hipchat)({
      level: Config.log.hipchat.level,
      token: Config.log.hipchat.token,
      room: Config.log.hipchat.room,
    });
    transports.push(item);
  }

  GLOBAL.logger = new (winston.Logger)({
    transports: transports,
    levels: logLevels,
    colors: logColors
  });

};
