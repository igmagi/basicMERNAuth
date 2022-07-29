const nodemailer = require("nodemailer");
const SMTPTransport = require("nodemailer/lib/smtp-transport");

const sendEmail = (opt)=>{
    const transporter = nodemailer.createTransport(new SMTPTransport({
        host: 'smtp.ionos.es',
        port: 587,
        auth: {
            user: 'info@queydondeestudiar.com',
            pass: 'd4f330497fd38ed3efec8b75cf4'
        },
        tls: {rejectUnauthorized: false},
        debug:true
    })
    );

    const mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: opt.to,
        subject: opt.subject,
        html: opt.text
    }

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
           console.log(info.accepted[0], "sent.")
        }
    })
}

module.exports = sendEmail