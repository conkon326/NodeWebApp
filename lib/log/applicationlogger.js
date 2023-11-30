const logger = require("./logger.js").application;

module.exports = function (options) {
  return function (err, req, res, nest) {
    logger.error(err.message);
    nest(err);
  };
};