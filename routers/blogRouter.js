const express = require("express");
const blogRouter = express.Router();
const { check } = require("express-validator");
const { addBlog,allBlogs,blogDetails, deleteBlog, myBlogs, updateBlog, secureBlogDetails, postBlog} = require("../controllers.js/blogsControllers");
const { urlValidator } = require("../validators/urlValidators");
const auth = require("../middlewares.js/auth")
const auth2 = require("../middlewares.js/auth2")



//route to get all blogs
blogRouter.get("/all-blogs",allBlogs);

//route to get posted blog details 
blogRouter.get("/blog-details/:blogId",blogDetails);

blogRouter.use(auth);
//route to get personal blog lists(drafted and posted)
blogRouter.get("/my-blogs",myBlogs);
blogRouter.use(auth2);

//route to add blog
blogRouter.post("/add-blog",[check("title").not().isEmpty(),check("description").not().isEmpty(),check("featureImage").not().isEmpty().custom((value)=>{
    const result = urlValidator(value);
    if(result==false)
    throw new Error("Invalid Url");

    return true;
}),check("thumbnail").not().isEmpty().custom((value)=>{
    const result = urlValidator(value);
    if(result==false)
    throw new Error("Invalid Url");
    
    return true;
})],addBlog);


//route to update blog
blogRouter.put("/update-blog/:blogId",[check("title").not().isEmpty(),check("description").not().isEmpty(),check("featureImage").not().isEmpty().custom((value)=>{
    const result = urlValidator(value);
    if(result==false)
    throw new Error("Invalid Url");

    return true;
}),check("thumbnail").not().isEmpty().custom((value)=>{
    const result = urlValidator(value);
    if(result==false)
    throw new Error("Invalid Url");
    
    return true;
})],updateBlog);
// route to get blog details securely for updation
blogRouter.get("/secureBlog-details/:blogId",secureBlogDetails);
//route to delete a blog
blogRouter.delete("/delete-blog/:blogId",deleteBlog);
// route to post a drafted blog
blogRouter.put("/post-blog/:blogId",postBlog);
module.exports = blogRouter;
