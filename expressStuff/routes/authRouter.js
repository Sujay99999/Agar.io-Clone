const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// require("./../controllers/passportController");
const authController = require("./../controllers/authController");
const router = express.Router();

// router.post("/basic", authController.verifyBasic);

// Google authentication
router.get(
  "/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  })
);
// NOTE: Never use the success callback,it doesnt contain the req.user
router.get(
  "/google/redirect",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
    failureRedirect: "/auth/google",
  }),
  authController.sendCookie,
  authController.redirectGame
);

module.exports = router;
