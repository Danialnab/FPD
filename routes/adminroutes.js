const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Req = require("../models/requests");
const Log = require("../models/logs");

router.get("/", async (req, res) => {
  const [usersCount, requestsCount, logsCount, users] = await Promise.all([
    User.count({}),
    Req.count({}),
    Log.count({}),
    User.find({}),
  ]);

  let userstats = {};
  for (let each of users) {
    const userCount = await Req.count({ owner: each.id });
    userstats[each.username] = userCount;
  }

  res.render("admin/dash", {
    usersCount,
    requestsCount,
    logsCount,
    userstats,
  });
});

router.post("/chartdata", async (req, res) => {
  const lastSevenDaysReqs = await Req.find({
    timestamp: {
      $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000),
    },
  });

  let chartData = {};
  for (let each of lastSevenDaysReqs) {
    const date = each.createdAt.getDate();
    if (!chartData[date]) {
      chartData[date] = 0;
    }
    chartData[date]++;
  }

  res.send(chartData);
});

router.get("/users", async (req, res) => {
  const users = await User.find({});
  res.render("admin/users", { users });
});

router.get("/logs", async (req, res) => {
  console.log(req.query);
  const options = {
    page: req.query.page || "1",
    limit: 20,
    sort: { createdAt: -1 },
    populate: "owner",
  };
  // const logs = await Log.find().populate("owner").sort({ createdAt: -1 });
  const logs = await Log.paginate({}, options, function (err, result) {
    const logsRaw = result;
    res.render("admin/logs", { logsRaw });
  });
});

router.post("/users", async (req, res) => {
  const { email, role, username, password } = req.body;
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
  const user = new User({ email, username, role });
  const registeredUser = await User.register(user, password);
  res.send(`admin created: ${username}, ${password}`);
});

module.exports = router;
