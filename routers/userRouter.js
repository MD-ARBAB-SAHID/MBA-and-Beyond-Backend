const express = require("express");
const userRouter = express.Router();
const { check } = require("express-validator");
const { signUp, login } = require("../controllers.js/userControllers");
//create new account for user route
userRouter.post(
  "/sign-up",
  [
    check("name").not().isEmpty(),
    check("email").isEmail(),
    check("password").isLength({ min: 5 }),
    check("confirmPassword").isLength({ min: 5 }),
  ],
  signUp
);

//login route
userRouter.post(
  "/login",
  [check("email").isEmail(), check("password").not().isEmpty()],
  login
);

module.exports = userRouter;
