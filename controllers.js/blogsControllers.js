const {validationResult} = require("express-validator")
const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const User = require("../models/users")
const Blog = require("../models/blogs")
const Comment  = require("../models/comments")

//controller to post a drafted blog
const postBlog = async(req,res,next)=>{
    const existingUser = req.existingUser; 
    const blogId = req.params.blogId; 
    // finding the blog to be updated
    let blog;
    try{
        blog = await Blog.findById(blogId);
    }catch(err)
    {

        return next(new HttpError("Blog not found to update",404));
    }
    //if blog is not found
    if(!blog)
    return next(new HttpError("Blog not found to update",404));
    
    //checking if authorise owner has requested to post the blog
    if(blog && blog.owner.toString()!==existingUser.id.toString())
    return next(new HttpError("Cannot post blog as you are not the owner.",401));

    //checking if blog is already posted
    if(blog.blogStatus==="posted")
    return next(new HttpError("Blog is already posted",402));

    blog.blogStatus = "posted";

    try{
        blog = await blog.save();
    }catch(err)
    {
        return next(new HttpError("Failed to update the blog,try again",500)); 
    }

    return res.status(201).json({message:"Blog posted successfully",blog});


}
//controller to add blog
const addBlog = async (req,res,next)=>{
    const errors = validationResult(req);
   
    //checking for input validation errors
    if(!errors.isEmpty())
    return next(new HttpError("Invalid inputs passed,please check your inputs",406)) ;
    const existingUser = req.existingUser;

    //checking whether the blog is to posted or added to drafts
    let blogStatus = "posted";
    if(req.query.blogStatus )
    {
        if (req.query.blogStatus==="drafted")
        {
            blogStatus="drafted"
        }else{
            return next(new HttpError("Invalid inputs passed,please check your inputs",406)) ;
        }
    }



    // retreiving blog data sent by user
    const {title,description,featureImage,thumbnail} = req.body;

    //creating new blog object
    const newBlog = new Blog({
        title,
        description,
        featureImage,
        thumbnail,
        owner:existingUser._id,
        comments:[],
        blogStatus:blogStatus
    });

    //saving blog and user with added blog id
    try{
        const sess = await mongoose.startSession();
       sess.startTransaction();
        await newBlog.save({ session: sess });
        existingUser.blogs.push(newBlog);
        await existingUser.save({ session: sess });
        await sess.commitTransaction();
    }catch(err)
    {

        return next(new HttpError("Failed to add blog,try again",500));
    }
    return res
    .status(201)
    .json({ message: "Blog Added Successfully ", blog: newBlog });

}

//controller to get list of all blogs
const allBlogs = async (req,res,next) =>{
    let blogs ;
    // fetching all blogs from database
    try{
        blogs = await Blog.find({blogStatus:"posted"},{title:true,thumbnail:true,owner:true,blogStatus:true}).populate('owner','name');
    }catch(err){

        return next(new HttpError("Failed to fetch blogs,try again",500));
    }

    return res.status(200).json(blogs);
}

//controller to get a blog details of a particular blog
const blogDetails = async (req,res,next) =>{
    let blogs ;
    const blogId = req.params.blogId;
    //fetching details of particular blog from database
    try{
        blogs = await Blog.find({_id:blogId,blogStatus:"posted"}).populate('owner','name').populate({
            path : 'comments',
            populate : {
              path : 'commenter',
              select:'name'
            }
          });
    }catch(err){

        return next(new HttpError("Failed to fetch blogs,try again",500));
    }
    if(blogs && blogs.length===0)
    return next(new HttpError("Blog not found,try again",404));
    const foundBlog = blogs[0];
    foundBlog.comments.reverse();
    return res.status(200).json(foundBlog);
}

// route to get blog details securely for updation
const secureBlogDetails = async(req,res,next)=>{
 
    let blogs ;
    const existingUser = req.existingUser;
    let incomingBlogStatus = "posted";
    if(req.query.blogStatus && req.query.blogStatus==="drafted")
    {
        incomingBlogStatus="drafted";
    }
    const blogId = req.params.blogId;
    //fetching details of particular blog from database
    try{
        blogs = await Blog.find({_id:blogId,blogStatus:incomingBlogStatus}).populate('owner','name').populate({
            path : 'comments',
            populate : {
              path : 'commenter',
              select:'name'
            }
          });
    }catch(err){

        return next(new HttpError("Failed to fetch blogs,try again",500));
    }


    
    if(!blogs)
    {
        return next(new HttpError("Blog Not Found",404));
    }
    if( blogs.length===0)
    {
        return next(new HttpError("Blog Not Found",404));
    }
    if(existingUser._id.toString()!==blogs[0].owner._id.toString())
    {

        return next(new HttpError("Authorization Failed",401));
        
    }
  
    return res.json(blogs[0]);
    
}

//controller to delete a blog
const deleteBlog = async (req,res,next)=>{

    const blogId = req.params.blogId;

    const existingUser = req.existingUser;

    let blogToBeDeletedStatus;
    // finding the blog to be deleted
    let blog;
    try{
        blog = await Blog.findById(blogId);
    }catch(err)
    {

        return next(new HttpError("Blog not found to delete",404));
    }
   //if blog is not found
    if(!blog)
    return next(new HttpError("Blog not found to delete",404));
    
    //checking if authorise owner has requested to delete the blog
    if(blog && blog.owner.toString()!==existingUser.id.toString())
    return next(new HttpError("Cannot delete blog as you are not the owner.",401));

    blogToBeDeletedStatus = blog.blogStatus;


    //deleting the blog along with the comments
    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await blog.remove({session:sess});
        await existingUser.blogs.pull(blog);
        await existingUser.save({session:sess})
        await Comment.deleteMany({blog:blog.id.toString()});
        sess.commitTransaction();
    }catch(err)
    {

        return next(new HttpError("Failed to delete blog,try again",500));
    }

    if(blogToBeDeletedStatus==="posted"){
        return res.redirect(303,`/api/blogs/my-blogs`);
    }
    //redirecting to get list of all my blogs
    return res.redirect(303,`/api/blogs/my-blogs?blogStatus=drafted`);


   
}

//controller to get list of my blogs (posted/drafted)
const myBlogs = async (req,res,next)=>{
    const tokenUserId = req.userData.userId

    let existingUser;
    let blogStatus = "posted";
    if(req.query.blogStatus )
    {
        if (req.query.blogStatus==="drafted")
        {
            blogStatus="drafted"
        }
    }
//finding the user in the database
    try{
        existingUser = await User.findById(tokenUserId,{blogs:true}).populate({path:'blogs',
        match:{
            blogStatus:blogStatus
        },
        select:'title thumbnail blogStatus'});
   }catch(err)
   {
       return next(new HttpError("Authorization failed",401));
   };

   //if user is not found in the datbase throw error
   if(!existingUser)
   {
       return next(new HttpError("Authorization failed",401));
   }

   return res.json(existingUser.blogs.reverse());
}

//controller to update a blog
const updateBlog = async (req,res,next)=>{
    const errors = validationResult(req);
   
    //checking for input validation errors
    if(!errors.isEmpty())
    return next(new HttpError("Invalid inputs passed,please check your inputs",406)) ;

    const blogId = req.params.blogId;

    const existingUser = req.existingUser;

    //retrieving the updated data sent by user

    const {title,description,featureImage,thumbnail} = req.body;

    
    // finding the blog to be updated
    let blog;
    try{
        blog = await Blog.findById(blogId);
    }catch(err)
    {

        return next(new HttpError("Blog not found to update",404));
    }
   //if blog is not found
    if(!blog)
    return next(new HttpError("Blog not found to update",404));
    
    //checking if authorise owner has requested to update the blog
    if(blog && blog.owner.toString()!==existingUser.id.toString())
    return next(new HttpError("Cannot update blog as you are not the owner.",401));

    blog.title = title;
    blog.description = description;
    blog.thumbnail = thumbnail;
    blog.featureImage = featureImage
    try{
        blog = await blog.save();
    }catch(err)
    {
        return next(new HttpError("Failed to update the blog,try again",500)); 
    }

    return res.status(201).json({message:"Blog updated successfully",updatedBlog:blog});

}


exports.addBlog = addBlog;
exports.allBlogs = allBlogs;
exports.blogDetails = blogDetails;
exports.deleteBlog = deleteBlog;
exports.updateBlog = updateBlog;
exports.myBlogs = myBlogs
exports.secureBlogDetails = secureBlogDetails
exports.postBlog = postBlog;
