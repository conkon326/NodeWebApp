const {
  ACCOUNT_LOCK_WINDOW,
  ACCOUNT_LOCK_THRESHOLE,
  ACCOUNT_LOCK_TIME,
  MAX_LOGIN_HISTORY
} = require("../../config/application.config.js").security;
const moment = require("moment");
const passport = require("passport");
const bcrypt = require("bcrypt");
const localstrategy = require("passport-local").Strategy;
const { MySQLClient, sql } = require("../database/client.js");
const PRIVILEGE = {
  NORMAL: "nomal"
};
const LOGIN_STATUS = {
  SUCCESS: 0,
  FAILURE: 1
};

var initalize, authenticate, authorize;

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  "local-strategy",
  new localstrategy({
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true
  }, async (req, username, password, done) => {
    var results, user, count;
    var now = new Date();
    try {
      // ユーザー情報取得
      results = await MySQLClient.executeQuery(
        await sql("SELECT_USER_BY_EMAIL"), [username]
      );
      if (results.length !== 1) {
        return done(null, false, req.flash("message", "ユーザー名 またはパスワードが間違っています。"));
      }
      user = {
        id: results[0].id,
        name: results[0].name,
        email: results[0].email,
        permissions: [PRIVILEGE.NORMAL]
      };


      // 垢ロック確認
      if (results[0].locked &&
        moment(now).isSameOrBefore(
          moment(results[0].locked).add(ACCOUNT_LOCK_TIME, "minutes")
        )) {
        return done(null, false, req.flash("message", "アカウントがロックされています。"));
      }
      // DELETE old login data
      MySQLClient.executeQuery(
        await sql("DELETE_LOGIN_HISTORY"), [user.id, user.id, MAX_LOGIN_HISTORY - 1]
      );
      //パスワードの比較
      if (!await bcrypt.compare(password, results[0].password)) {
        // Inset login log
        MySQLClient.executeQuery(
          await sql("INSERT_LOGIN_HISTORY"), [user.id, now, LOGIN_STATUS.FAILURE]
        );
        // lock account, if need

        let tmp = await MySQLClient.executeQuery(
          await sql("CONT_LOGIN_HISTORY"),
          [
            user.id,
            moment(now).subtract(ACCOUNT_LOCK_WINDOW, "minutes").toDate(),
            LOGIN_STATUS.FAILURE
          ]
        );

        count = (tmp || [])[0].count;
        if (count >= ACCOUNT_LOCK_THRESHOLE) {
          await MySQLClient.executeQuery(
            await sql("UPDATE_USER_LOCKED"),
            [
              now, user.id
            ]
          );

        }
        return done(null, false, req.flash("message", "ユーザー名 またはパスワードが間違っています。"));
      }
      // Inset login log
      MySQLClient.executeQuery(
        await sql("INSERT_LOGIN_HISTORY"), [user.id, now, LOGIN_STATUS.SUCCESS]
      );

      // ロック解除
      await MySQLClient.executeQuery(
        await sql("UPDATE_USER_LOCKED"),
        [
          null, user.id
        ]
      );

    } catch (err) {
      return done(err);
    }

    //セッション再生成
    req.session.regenerate((err) => {
      if (err) {
        done(err);
      } else {
        done(null, user);
      }
    });
  })
);

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

authenticate = function () {
  return passport.authenticate(
    "local-strategy",
    {
      successRedirect: "/account",
      failureRedirect: "/account/login"
    }
  );
};

authorize = function (privilege) {
  return function (req, res, next) {
    if (req.isAuthenticated() &&
      ((req.user.permissions || []).indexOf(privilege) >= 0)) {
      next();
    } else {
      res.redirect("/account/login");
    }
  };
};
module.exports = {
  initalize,
  authenticate,
  authorize,
  PRIVILEGE
};


