const log4js = require("log4js");
const config = require("../../config/log4js.config.js");
var console, application, access;


log4js.configure(config);

// コンソールlogger
console = log4js.getLogger();
application = log4js.getLogger("application");

// アクセスlogger

access = log4js.getLogger("access");
module.exports = {
  console,
  application,
  access
};