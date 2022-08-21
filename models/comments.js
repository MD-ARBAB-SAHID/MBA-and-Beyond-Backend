const mongoose = require("mongoose");
//schema for comments
const commentsSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true,
  },
  blog: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Blog",
  },
  commenter: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

const commentModel = new mongoose.model("Comment", commentsSchema);

module.exports = commentModel;
