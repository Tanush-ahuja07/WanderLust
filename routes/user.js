const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/user.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controllers/users.js");

//sign up

router
        .route("/signup")
        .get(userController.renderSignup)
        .post(wrapAsync(userController.signup));

// login
router.route("/login")
.get(userController.renderLogin)
.post(
        saveRedirectUrl,
        passport.authenticate('local',{
                failureRedirect : '/login',
                failureFlash : true}),
        userController.login
)


//logout
router.get("/logout",userController.logout);


module.exports = router;