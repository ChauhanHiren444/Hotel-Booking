const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
   res.render("user/signup.ejs");
};

module.exports.signup = async (req, res) => {
   try {
      let { username, email, password } = req.body;
      const newuser = new User({ email, username });
      const registeredUser = await User.register(newuser, password);
      // console.log(registeredUser);
      req.login(registeredUser, (err) => {
         if (err) {
            return next(err);
         }
         req.flash("success", "You logged in");
         res.redirect("/listings");
      });
   } catch (e) {
      req.flash("error", e.message);
      res.redirect("/listings");
   }
};

module.exports.renderLoginForm = (req, res) => {
   res.render("user/login.ejs");
};

module.exports.login = async (req, res) => {
   req.flash("success", "Welcome to the Wanderlust");
   if (res.locals.redirectUrl) {
      res.redirect(res.locals.redirectUrl);
   } else {
      res.redirect("/listings");
   }
};

module.exports.logout = (req, res, next) => {
   req.logOut((err) => {
      if (err) {
         return next(err);
      }
      req.flash("success", "You logged out");
      res.redirect("/listings");
   });
};
