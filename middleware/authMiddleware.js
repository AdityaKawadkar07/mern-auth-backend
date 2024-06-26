const asyncHandler=require("express-async-handler");
const User= require("../models/userModel");
const jwt=require("jsonwebtoken");

const protect = asyncHandler(async(req,res, next)=>{
    try{
        const token=req.cookies.token
        if(!token){
            res.status(401);
            throw new Error("Not authorized, please Login");
        }

        //Verify Token
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        //Get user id from token
        const user = await User.findById(verified.id).select("-password");
        if(!user){
            res.status(404);
            throw new Error("User not found");
        }
        if(user.role==="suspended"){
            res.status(400);
            throw new Error("User suspended, please contact support");
        }

        req.user= user;
        next();

    }
    catch(err){
        res.status(400);
        throw new Error("Not authorized, please Login")
    }
});

const adminOnly=asyncHandler(async(req,res,next)=>{
    if(req.user && req.user.role === "admin"){
        next();
    }
    else{
        res.status(401);
        throw new Error("Not Authorized as an admin")
    }
});

const authorOnly=asyncHandler(async(req,res,next)=>{
    if(req.user.role==="author" || req.user.role === "admin"){
        next();
    }
    else{
        res.status(401);
        throw new Error("Not Authorized as an author");
    }
});

const verifiedOnly=asyncHandler(async(req,res,next)=>{
    if(req.user && req.user.isVerified){
        next();
    }
    else{
        res.status(401);
        throw new Error("Not Authorized, account not verifed");
    }
});


module.exports= {
    protect,
    verifiedOnly,
    authorOnly,
    adminOnly,
}