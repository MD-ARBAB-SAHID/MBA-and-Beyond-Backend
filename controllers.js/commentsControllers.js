const {validationResult} = require("express-validator")
const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const User = require("../models/users")
const Blog = require("../models/blogs")
const Comment = require("../models/comments")


//controller to add a comment to a blog
const addComment = async (req,res,next)=>{
    const existingUser = req.existingUser;  
    const errors = validationResult(req);
    const blogId = req.params.blogId;
    
    //checking for input validation errors
    if(!errors.isEmpty())
    return next(new HttpError("Invalid inputs passed,please check your inputs",406)) ;
    const {comment} =req.body;

    let blog;
    //finding the blog in which comment is going to add
    try{
        blog = await Blog.findById(blogId);
    }catch{
        return next(new HttpError("Blog not found,try again",404)) ;
    }

    //if blog is not find throw error
    if(!blog)
    return next(new HttpError("Unable to find the blog",404)) ;
    if(blog.blogStatus==="drafted")
    {
        return next(new HttpError("Cannot comment on a drafted post.",406)) ;
    }
    //creating new comment for the blog
    const newComment = new Comment({
            comment,
            commenter:existingUser._id,
            blog:blog._id
    });

    //saving the comment and blog with added comment id
    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await newComment.save({session:sess});
        blog.comments.push(newComment);
        await blog.save({session:sess});
        sess.commitTransaction();
    }catch(err){
        return next(new HttpError("Unable to add comment,try again",500)) ;
    }
    return res.redirect(`/api/blogs/blog-details/${blogId}`)
   
}


exports.addComment = addComment