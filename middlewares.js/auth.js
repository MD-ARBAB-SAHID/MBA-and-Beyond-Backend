const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");


const auth = (req,res,next)=>{
   
   if(req.method==="OPTIONS")
   {
       return next();
   }
    try{
        
        const token = req.headers.authorization.split(' ')[1];

        if(!token)
        {
            throw new Error("No Token Found");
        }
        // checking structure of token
        const structureTokenCheck = token.split(".");
        if(structureTokenCheck.length!==3)
        {
            return next(new HttpError("Authorization Failed",401))
        }
        
        const decodedToken =  jwt.verify(token,`${process.env.JWT_KEY}`);
        req.userData = {
            userId:decodedToken.userId
        }
        next();
    }catch(err)
    {

        return next(new HttpError("Authorization failed",401));
    }
}

module.exports = auth;