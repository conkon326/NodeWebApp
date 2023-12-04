const PORT = process.env.PORT || 3000;
const path = require("path");
const logger = require("./lib/log/logger.js");
const accesslogger = require("./lib/log/accesslogger.js");
const applicationlogger = require("./lib/log/applicationlogger.js");
const express = require("express");
const favicon = require("serve-favicon");
const cookie = require("cookie-parser");
const app = express();

// Express settings
app.set("view engine", "ejs");
app.disable("x-powered-by");

// Expose global method to view engine.
app.use((req, res, next) => {
  res.locals.moment = require("moment");
  res.locals.padding = require("./lib/math/math.js").padding;
  next();
});

// Static resource rooting.
app.use(favicon(path.join(__dirname, "/public/favicon.ico")));
app.use("/public", express.static(path.join(__dirname, "/public")));

// Set access log.
app.use(accesslogger());

// Set middleware
app.use(cookie());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(req.cookies.message);
  res.cookie("message", "HEllo world");
  next();
});

// Dynamic resource rooting.

app.use("/account", require("./routes/account.js"));
app.use("/search", require("./routes/search.js"));
app.use("/shops", require("./routes/shops.js"));
app.use("/", require("./routes/index.js"));

// Set application log.
app.use(applicationlogger());

// Execute web application.
app.listen(PORT, () => {
  logger.application.info(`Application listening at :${PORT}`);
});
