const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { isLoggedIn, saveRedirectUrl } = require("../middlewares.js");
const userController = require("../controller/user.js");

router
   .route("/signup")
   // for get signup form
   .get(userController.renderSignupForm)
   // for singup user
   .post(wrapAsync(userController.signup));

router
   .route("/login")
   // for get login form
   .get(userController.renderLoginForm)
   // for user login
   .post(
      saveRedirectUrl, // we called middleware first to get url and then authenticate
      passport.authenticate("local", {
         failureRedirect: "/login", // redirect if failure
         failureFlash: true, // flash msg if failure
      }),
      userController.login
   );

// for user logout
router.get("/logout", userController.logout);

module.exports = router;
