const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");
const User = require("../models/users");

//controller for signup
const signUp = async (req, res, next) => {
  const errors = validationResult(req);

  //checking for validation errors
  if (!errors.isEmpty())
    return next(
      new HttpError("Invalid inputs passed,please check your inputs", 406)
    );

  const { name, email, password, confirmPassword } = req.body;
  if (
    password.length !== confirmPassword.length ||
    password !== confirmPassword
  )
    return next(
      new HttpError("Password and Confirm Password does not match", 406)
    );
  let existingUser;

  // checking if any user exist with  email id
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Sign Up failed ,try again later", 500));
  }

  if (existingUser)
    return next(
      new HttpError("User is already registered with the email id.", 406)
    );

  let hashedPass;
  // creating a hashed password for the user
  try {
    hashedPass = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Could not create user,please try again", 500));
  }

  let createdUser;

  createdUser = new User({
    name,
    email,
    password: hashedPass,
    blogs: [],
  });

  //saving user

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError("SignUp failed ,please try again ", 500));
  }

  //saving user credentials
  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError("SignUp failed ,please try again ", 500));
  }

  let token;
  //generating token for the user
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      `${process.env.JWT_KEY}`,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Could not sign you in,please try again", 500));
  }

  res.json({
    userId: createdUser.id,
    email: createdUser.email,
    accessToken: token,
  });
};

//controller for login
const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(
      new HttpError("Invalid inputs passed,please check your inputs", 406)
    );
  let existingUser;

  const { email, password } = req.body;

  //finding user in the database
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Sign Up failed ,try again later", 500));
  }

  //if no user found
  if (!existingUser) {
    return next(new HttpError("Invalid credentials", 401));
  }

  let passIsValid = false;

  //verifying the password
  try {
    passIsValid = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(
      new HttpError(
        "Could not log you in,please check your credentials and try again",
        500
      )
    );
  }
  if (!passIsValid) {
    return next(
      new HttpError(
        "Could not log you in,please check your credentials and try again",
        401
      )
    );
  }

  //generating token for the logged in user
  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      `${process.env.JWT_KEY}`,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Could not log you in,please try again", 500));
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    accessToken: token,
  });
};

exports.login = login;
exports.signUp = signUp;
