const User = require("../models/User");
const ErrorResponse = require("../middleware/errorResponseHandler");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

exports.register = async (req, res, next) => {
    console.log(`/register: ${req.body.email}`)
    const {
        email,
        password,
        name,
        surname,
        degree
    } = req.body;

    try {
        const user = await User.create({
            email,
            password,
            name,
            surname,
            degree,
        });
        sendToken(user, 200, res);
    } catch (error) {
        return next(error);
    }
};

exports.login = async (req, res, next) => {
    console.log(`/login: ${req.body.email}`)

    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse(400, "Provide email and password."));
    }

    try {
        const user = await User.findOne({
            email
        }).select("+password");
        if (!user) {
            return next(new ErrorResponse(401, "Invalid credentials."));
        }

        const doPasswordsMatch = await user.matchPasswords(password);
        if (!doPasswordsMatch) {
            return next(new ErrorResponse(401, "Invalid credentials."));
        } else {
            sendToken(user, 201, res);
        }
    } catch (error) {
        return next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    console.log(`/forgotpassword: ${req.body.email}`)

    const {
        email
    } = req.body;

    try {
        const user = await User.findOne({
            email
        });
        if (!user) {
            return next(new ErrorResponse(404, "Email could not be sent"));
        }

        const resetToken = await user.getResetPasswordToken();

        await user.save();

        const resetUrl = `${process.env.FRONT_END}/resetpassword/${resetToken}`;
        console.log(resetUrl);
        const msg = `
            <h1> QYDE </h1>
            <h2> Se ha solicitado un cambio de constraseña en este correo. </h2>
            <p>Para poder reestablecer tu contraseña, haz click en el siguiente enlace: </p>
            <a href=${resetUrl} clicktracking="off"> Establecer nueva contraseña.</a>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: "Reestablecer contraseña",
                text: msg,
            });

            res.status(200).json({
                succes: true,
                data: "Email sent",
            });
        } catch (error) {
            user.resetPasswordExpire = undefined;
            user.resetPasswordToken = undefined;

            await user.save();
            console.log(error);
            return next(new ErrorResponse(500, "Email could not be sent"));
        }
    } catch (error) {
        return next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    console.log(`/resetpassword`)

    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.resetToken)
        .digest("hex");

    try {
        const user = await User.findOne({
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpire: {
                $gt: Date.now()
            },
        });

        if (!user) {
            return next(new ErrorResponse(400, "Invalid token"));
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.save()
        res.status(201).json({success: true, data:"Password reset successfuly"})
    } catch (error) {
        return next(error)
    }


};


const sendToken = async (user, statusCode, res) => {
    const token = await user.getSignedToken();
    res.status(statusCode).json({
        success: true,
        token: token,
    });
};