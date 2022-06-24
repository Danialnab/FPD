const express = require("express");
const router = express.Router();
const Log = require("../models/logs");
const passport = require("passport");

router.get("/login", async (req, res) => {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  async (req, res) => {
    const newLog = new Log({
      action: `${req.user.username} Logged in`,
      owner: req.user,
    });
    await newLog.save();
    res.redirect("/");
  }
);

router.get("/logout", async (req, res) => {
  const newLog = new Log({
    action: `${req.user.username} Logged out`,
    owner: req.user,
  });
  newLog.save();
  req.logOut();
  res.redirect("/user/login");
});

module.exports = router;
