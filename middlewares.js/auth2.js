const HttpError = require("../models/http-error");
const User =    require("../models/users");

const AuthenticationFirst = async (req,res,next)=>{
   

    const tokenUserId = req.userData.userId

    let existingUser;

//finding the user in the database
    try{
        existingUser = await User.findById(tokenUserId);
   }catch(err)
   {
       return next(new HttpError("Authorization failed",401));
   };

   //if user is not found in the datbase throw error
   if(!existingUser)
   {
       return next(new HttpError("Authorization failed",401));
   }

   req.existingUser = existingUser;

   next();

}

module.exports = AuthenticationFirst;