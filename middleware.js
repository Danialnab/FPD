module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must login first");
    return res.redirect("/user/login");
  }
  next();
};

module.exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    req.flash("error", "You do not have access to this section");
    return res.redirect("/");
  }
  next();
};
