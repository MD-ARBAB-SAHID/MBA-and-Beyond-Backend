const express = require("express");
const commentRouter = express.Router();
const { check } = require("express-validator");
const auth = require("../middlewares.js/auth");
const auth2 = require("../middlewares.js/auth2");

const { addComment } = require("../controllers.js/commentsControllers");

commentRouter.use(auth);
commentRouter.use(auth2);
//route to add a comment to a blog
commentRouter.post(
  "/add-comment/:blogId",
  [check("comment").not().isEmpty()],
  addComment
);

module.exports = commentRouter;
