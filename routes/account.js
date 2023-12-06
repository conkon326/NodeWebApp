const router = require("express").Router();
const { authenticate, authorize, PRIVILEGE } = require("../lib/security/accesscontrol.js");

router.get("/", authorize(PRIVILEGE.NORMAL), (req, res) => {
  res.render("./account/index.ejs");
});

router.get("/login", (req, res) => {
  res.render("./account/login.ejs", { message: req.flash("message") });
});

router.post("/login", authenticate());

router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("ログアウトエラー");
    }
    res.redirect("/account/login");
  });
});

router.use("/reviews", authorize(PRIVILEGE.NORMAL), require("./account.reviews.js"));

module.exports = router;