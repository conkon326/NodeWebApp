const PORT = process.env.PORT;
const express = require("express");
const app = express();

app.set("view engine", "ejs");

app.use("/", require("./routes/index.js"));

app.listen(PORT, () => {
  console.log(`Application listening at ${PORT}`);
});

