const jwt=require('jsonwebtoken');
const User=require('../models/User');

const authMiddleware=async(req,res,next)=>{
    try{
        let token;

        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token=req.headers.authorization.split(' ')[1];
        }

        if(!token){
            return res.status(401).json({message:'Unauthorized, no token provided'});
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=await User.findById(decoded.userId).select('-password');

        if(!req.user){
            return res.status(401).json({message:'Unauthorized, user not found'});
        }

        req.user.lastActive=Date.now();
        await req.user.save();
        next();

    }
    catch(error){
        console.error(error);
        res.status(401).json({message:'Unauthorized'});
    }
}

const adminMiddleware=(req,res,next)=>{
    if(req.user && req.user.isAdmin){
        next();
    }else{
        res.status(403).json({message:'Forbidden, admin access required'});
    }
}

module.exports={authMiddleware,adminMiddleware};