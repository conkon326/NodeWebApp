const PORT = process.env.PORT || 3000;
const path = require("path");
const logger = require("./lib/log/logger.js");
const applicationlogger = require("./lib/log/applicationlogger.js");
const accesslogger = require("./lib/log/accesslogger.js");
const express = require("express");
const favicon = require("serve-favicon");
const app = express();

// expressの設定
app.set("view engine", "ejs");
app.disable("x-powered-by");

// グローバルメソッドをviewエンジンに渡す
app.use((req, res, next) => {
  res.locals.moment = require("moment");
  res.locals.padding = require("./lib/math/math.js").padding;
  next();
});

// 静的コンテンツのルーティング
app.use(favicon(path.join(__dirname, "/public/favicon.ico")));
app.use("/public", express.static(path.join(__dirname, "/public")));

// set アクセスログ
app.use(accesslogger());

// 動的コンテンツのルーティング
app.use("/shops", require("./routes/shops.js"));
app.use("/", require("./routes/index.js"));

// Set アプリケーションログ
app.use(applicationlogger());

// WEBアプリの実行
app.listen(PORT, () => {
  // アプリケーションがリスニングを開始したことをログに出力
  logger.application.info(`Application listening at :${PORT}`);
});
