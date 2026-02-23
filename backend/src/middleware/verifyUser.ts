import { NextFunction } from "express";
import jwt from "jsonwebtoken"

/*=================Verify User token middleware ==============*/
export const verifyToken = (req , res, next)=>{
    const token = req.cookies.Auth_Token;

    if(!token){
        return res.status(401).json({status : false , message : "Unauthorized !"});
    }

    try {
        const decoded = jwt.verify(token , process.env.SECRET_KEY)
        req.user = decoded.user;
        next()
    } catch (error) {
        return res.status(401).json({status : false , message: "Invalid token" });
    }
}