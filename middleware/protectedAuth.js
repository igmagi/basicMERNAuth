const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ErrorResponse = require("../middleware/errorResponseHandler");


exports.protect = async (req, res, next) =>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("QBearer")){
        token = req.headers.authorization.split(" ")[1];
    }
    if(!token){
        return next(new ErrorResponse(401, "Not authorized."))
    }

    try {
        const decodedJWT = await jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decodedJWT.id)

        if(!user){
            return next(new ErrorResponse(401, "Not authorized."))
        }

        req.user = user;
        
        next();
    } catch (error) {
        return next(new ErrorResponse(401, "Not authorized."))
    }
}