const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Req = require("../models/requests");
const Log = require("../models/logs");

router.get("/", async (req, res) => {
  const usersCount = User.count({});
  const requestsCount = Req.count({});
  res.render("admin/dash", {});
});

router.get("/users", async (req, res) => {
  const users = await User.find({});
  res.render("admin/users", { users });
});

router.get("/logs", async (req, res) => {
  const logs = await Log.find().sort({ createdAt: -1 });
  res.render("admin/logs", { logs });
});

router.post("/users", async (req, res) => {
  const { email, role, username, password } = req.body;
  console.log(email, username, password);
  const user = new User({ email, username, role });
  const registeredUser = await User.register(user, password);
  req.flash("success", "User added to the system");
  res.redirect("/admin/users");
});

router.post("/userdel", async (req, res) => {
  const user = await User.findOneAndDelete(req.body);
  res.send("done");
});

router.get("/createadmin", async (req, res) => {
  const email = "admin@admin.com";
  const username = "admin";
  const password = "adminpassadmin";
  const role = "admin";
  console.log(email, username, password);
  const user = new User({ email, username, role });
  const registeredUser = await User.register(user, password);
  res.send(`admin created: ${username}, ${password}`);
});

module.exports = router;
