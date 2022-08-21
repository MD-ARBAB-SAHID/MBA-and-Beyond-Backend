const mongoose = require("mongoose");
//schema for users
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    
    blogs:[{type: mongoose.Types.ObjectId,required:true,ref:"Blog"}]
   
})

const userModel = new mongoose.model('User',userSchema);


module.exports =  userModel;