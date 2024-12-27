import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";


export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
    
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
        const user = User.findById(decodedToken._id).select("-password -refreshTokens")
    
        if(!user){
            throw new ApiError(401,"Invailed access Token");
            
        }

        req.user = user;
        next(); // is very important to call next() to move to the next middleware
    } catch (error) {
        throw new ApiError(401,error?.message || "Invailed access token ");
        
    }

})