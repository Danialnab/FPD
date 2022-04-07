const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/", async (req, res) => {
  res.render("admin/dash");
});

router.get("/users", async (req, res) => {
  res.render("admin/users");
});
router.post("/users", async (req, res) => {
  const { email, username, password } = req.body;
  console.log(email, username, password);
  const user = new User({ email, username });
  const registeredUser = await User.register(user, password);
  req.flash("success", "User added to the system");
  res.redirect("/admin/users");
});

// router.get("/createadmin", async (req, res) => {
//   const email = "admin@admin.com";
//   const username = "admin";
//   const password = "adminpassadmin";
//   console.log(email, username, password);
//   const user = new User({ email, username });
//   const registeredUser = await User.register(user, password);
//   res.send(`admin created: ${username}, ${password}`);
// });

module.exports = router;
