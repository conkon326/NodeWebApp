const passport = require("passport");

var initalize, authenticate, authorize;
initalize = function () {
  return [
    passport.initialize(),
    passport.session(),
    function (req, res, next) {
      if (req.user) {
        res.locals.user = req.user;
      }
      next();
    }
  ];
};

module.exports = {
  initalize,
  authenticate,
  authorize
};