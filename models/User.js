const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Provide an email."],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Provide a valid email."
        ]
    },
    password: {
        type: String,
        required: [true, "Provide a password."],
        minlength: 6,
        select: false
    },
    name:{
        type: String,
        required: [true, "Provide a name."],
        maxlength: 50
    },
    surname:{
        type: String,
        required: [true, "Provide your surname."],
        maxlength: 75
    },
    degree:{
        type: Number,
        required: [true, "Select a degree."] 
    },
    degreeChangeOportunities: {
        type: Number,
        default: 3,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
})
UserSchema.pre("save", async function(next) {
    if(!this.isModified("password")){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
    next();
})


UserSchema.methods.matchPasswords = async function (password){
    return await bcrypt.compare(password, this.password)
}

//JWT
UserSchema.methods.getSignedToken = async function (){
    const tk = await jwt.sign({id: this._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES});
    return tk;
}

//ResetPasswordToken
UserSchema.methods.getResetPasswordToken = async function (){
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + parseInt(process.env.RESET_PWD_EXPIRE)
    return resetToken;
}

const User = mongoose.model("User", UserSchema);
module.exports = User;