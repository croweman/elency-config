"use strict";

var logLevels = {
  NONE: 0,
  TRACE: 1,
  INFO: 2,
  DEBUG: 4,
  WARN: 8,
  ERROR: 16,
  FATAL: 32
};

function appendMessage(logMessage, message) {
  if (!logMessage.msg) {
    logMessage.msg = '';
  }

  logMessage.msg += `${(logMessage.msg.length > 0 ? ', ' : '')}${message}`;
}

function appendError(logMessage, error) {

  let errorObj = {
    msg: error.toString(),
    stack: error.stack
  };

  if (!logMessage.error) {
    logMessage.error = errorObj;
  }
  else {
    if (!Array.isArray(logMessage.error)) {
      logMessage.error = [logMessage.error];
    }

    logMessage.error.push(errorObj)
  }
}

function appendData(logMessage, data) {

  JSON.stringify(data);

  if (!logMessage.data) {
    logMessage.data = data;
  }
  else {
    if (!Array.isArray(logMessage.data)) {
      logMessage.data = [logMessage.data];
    }

    logMessage.data.push(data);
  }
}

function logMessage(logLevel, requiredLogLevelName, requiredLogLevel, args) {

  if (!((logLevel & requiredLogLevel) == requiredLogLevel)) {
    return;
  }

  let definedArgs = args;

  if (!Array.isArray(definedArgs)) {
    definedArgs = [ definedArgs ];
  }

  definedArgs = definedArgs.filter((item) => { return item !== undefined && item !== null; });

  let logMessage = {
    time: new Date().toISOString(),
    pid: process.pid,
    level: requiredLogLevelName
  };

  for (let i = 0; i < definedArgs.length; i++) {

    let arg = definedArgs[i];

    if (typeof arg === 'string') {
      appendMessage(logMessage, arg);
    }
    else if (typeof arg === 'object') {
      if (arg instanceof Error) {
        appendError(logMessage, arg);
      }
      else {
        try {
          appendData(logMessage, arg);
        }
        catch (e) {
          appendMessage(logMessage, arg.toString());
        }
      }
    }
    else {
      appendMessage(logMessage, arg.toString());
    }
  };

  console.log(JSON.stringify(logMessage));
}

class logger {

  constructor(logLevel) {

    let requiredLevel = Object.keys(logLevels).find((key) => { return key === logLevel; });

    if (requiredLevel === undefined) {
      throw new Error('Unknown "LOG_LEVEL" defined on platform.fabric logger');
    }

    this.logLevel = logLevels.NONE;
    requiredLevel = logLevels[requiredLevel];

    switch (requiredLevel) {

      case logLevels.TRACE:
        this.logLevel = logLevels.TRACE | logLevels.DEBUG | logLevels.INFO | logLevels.WARN | logLevels.ERROR | logLevels.FATAL;
        break;
      case logLevels.DEBUG:
        this.logLevel = logLevels.DEBUG | logLevels.INFO | logLevels.WARN | logLevels.ERROR | logLevels.FATAL;
        break;
      case logLevels.INFO:
        this.logLevel = logLevels.INFO | logLevels.WARN | logLevels.ERROR | logLevels.FATAL;
        break;
      case logLevels.WARN:
        this.logLevel = logLevels.WARN | logLevels.ERROR | logLevels.FATAL;
        break;
      case logLevels.ERROR:
      case logLevels.FATAL:
      default:
        this.logLevel = logLevels.ERROR | logLevels.FATAL;
    }
  }

  trace(...args) {
    logMessage(this.logLevel, 'TRACE', logLevels.TRACE, args);
  }

  debug(...args) {
    logMessage(this.logLevel, 'DEBUG', logLevels.DEBUG, args);
  }

  info(...args) {
    logMessage(this.logLevel, 'INFO', logLevels.INFO, args);
  }

  warn(...args) {
    logMessage(this.logLevel, 'WARN', logLevels.WARN, args);
  }

  error(...args) {
    logMessage(this.logLevel, 'ERROR', logLevels.ERROR, args);
  }

  fatal(...args) {
    logMessage(this.logLevel, 'FATAL', logLevels.FATAL, args);
  }
}

const loggerInstance = new logger(process.env.LOG_LEVEL || 'INFO');

module.exports = loggerInstance;