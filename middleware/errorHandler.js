const ErrorResponse = require("./errorResponseHandler");

const errorHandler = (err, req, res, next) =>{
    let error = {...err};

    error.message = err.message;

    
    // Both errors thrown by mongoose when creating an entry
    if(err.name === "ValidationError"){ // Bad type/match
        const msg = `${err.message}`;
        error = new ErrorResponse(400, msg);
    }

    if(err.code === 11000){
        const msg = "Duplicate Entry";
        error = new ErrorResponse(400, msg);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Server Error"
    })
}

module.exports = errorHandler;