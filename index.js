const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const routes = require("./routes/routes");
const adminroutes = require("./routes/adminroutes");
const userroutes = require("./routes/userroutes");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const { isLoggedIn, isAdmin } = require("./middleware");
const methodOverrid = require("method-override");
const MongoDBStore = require("connect-mongodb-session")(session);

mongoose.connect("mongodb://localhost:27017/fpd");
mongoose.connection.on(
  "error",
  console.error.bind(console, "Connection Error")
);
mongoose.connection.on("open", () => {
  console.log("DB Connected");
});

const app = express();

const store = new MongoDBStore({
  uri: "mongodb://localhost:27017/fpd",
  collection: "mySessions",
});

store.on("error", function (error) {
  console.log(error);
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.locals.moment = require("moment");

app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname + "/public")));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));
app.use(methodOverrid("_method"));
app.use(flash());

const sessionConfig = {
  secret: "thisisasecret1",
  resave: false,
  saveUninitialized: true,
  store: store,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 9,
    maxAge: 1000 * 60 * 60 * 9,
  },
};
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.user;
  next();
});

app.use("/user", userroutes);
app.use("/admin", isLoggedIn, isAdmin, adminroutes);
app.use("/", isLoggedIn, routes);


app.listen(3000, "0.0.0.0", () => {
  console.log("serving on port 3000");
});
