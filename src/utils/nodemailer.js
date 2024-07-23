let nodemailer = require('nodemailer')
const { promisify } = require('util');
let config = require("../config/dbConfig")



let sendOtpUsingNodemailer = async (code, email) => {
    try {
       
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.GMAIL,
                pass: config.GMAIL_PASSWORD
            }
        });
    
        let mailDetails = {
            from: config.GMAIL,
            to: email,
            subject: 'Forget Password OTP',
            html: `
                <div style="padding: 30px; text-align: center; color: #333; background-color: #f0f0f0; font-family: Arial, sans-serif;">
                    <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-bottom: 20px;">Forget Password OTP</h2>
                        <div style=" color: #000; padding: 10px; border-radius: 4px; margin-bottom: 20px;">
                            <h1 style="font-size: 36px; margin: 0;">${code}</h1>
                        </div>
                        <p style="font-size: 16px; line-height: 1.6;">You have requested a password reset. Please use the OTP above to proceed.</p>
                        <p style="font-size: 14px; color: #888;">This OTP is valid for a limited time.</p>
                    </div>
                    <p style="font-size: 12px; color: #888; margin-top: 20px;">This email was sent from ${config.GMAIL}. Please do not reply to this email.</p>
                </div>
            `
        };
        
     
        
        const sendMail = promisify(transporter.sendMail.bind(transporter));
  
        await sendMail(mailDetails);
       
        return true
    } catch (error) {
        console.log("ERROR::", error);
        return false
    }
};

module.exports = {
    sendOtpUsingNodemailer
};


