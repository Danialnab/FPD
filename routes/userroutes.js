const express = require("express");
const router = express.Router();
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
    res.redirect("/");
  }
);

router.get("/logout", async (req, res) => {
  req.logOut();
  res.redirect("/user/login");
});

module.exports = router;
