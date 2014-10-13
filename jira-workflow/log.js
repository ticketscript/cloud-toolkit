var Config = require('./config')

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

  GLOBAL.logger = new (winston.Logger)({ transports: transports });
  var logColors = {
        info: 'blue',
        debug: 'green',
        warn: 'yellow',
        error: 'red'
      };
  winston.addColors(logColors);
};
