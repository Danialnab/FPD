const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const routes = require("./routes/routes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname + "/public")));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));

app.use("/", routes);

app.listen(3000, "0.0.0.0", () => {
  console.log("serving on port 3000");
});
