const PORT = process.env.PORT || 3000;
const path = require("path");
const logger = require("./lib/log/logger.js");
const applicationlogger = require("./lib/log/applicationlogger.js");
const accesslogger = require("./lib/log/accesslogger.js");
const express = require("express");
const favicon = require("serve-favicon");
const { sqlSync } = require("@garafu/mysql-fileloader");
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
app.get("/test", async (rew, res, next) => {
  const { MySQLClient } = require("./lib/database/client.js");
  var tran;
  try {
    tran = await MySQLClient.beginTransaction();
    await tran.executeQuery(
      "UPDATE t_shop SET SCORE =? WHERE id =?",
      [3.92, 1]
    );
    throw new Error("Test exepation");
    // await tran.commit();
    res.end("ok");
  } catch (err) {
    await tran.rollback();
    next(err);
  }
});
app.use("/search", require("./routes/search.js"));
app.use("/shops", require("./routes/shops.js"));
app.use("/", require("./routes/index.js"));

// Set アプリケーションログ
app.use(applicationlogger());

// WEBアプリの実行
app.listen(PORT, () => {
  // アプリケーションがリスニングを開始したことをログに出力
  logger.application.info(`Application listening at :${PORT}`);
});
