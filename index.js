const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const userRouter = require("./routers/userRouter");
const blogRouter = require("./routers/blogRouter");
const commentRouter = require("./routers/commentRouter");

const PORT = process.env.PORT || 5050;
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");

  next();
});
app.get("/", (req, res) => {
  res.send("connected to server");
});
app.use("/api/users", userRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/comments", commentRouter);

app.use((err, req, res, next) => {
  res
    .status(err.code || 500)
    .json({ error: err.message || "Something went wrong" });
});
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route Not Found" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7cxcdr0.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Running at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
