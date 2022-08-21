const mongoose = require("mongoose");
//schema for blogs
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  featureImage: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
  comments: [{ type: mongoose.Types.ObjectId, required: true, ref: "Comment" }],
  blogStatus: {
    type: String,
    require: true,
    //blogStatus shows whether the blog is posted or drafted
  },
});

const blogModel = new mongoose.model("Blog", blogSchema);

module.exports = blogModel;
