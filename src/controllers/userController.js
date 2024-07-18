let userModel = require('../models/userModel')
let { generateEncryptedPassword, comparePassword, generateToken, generateOTP } = require("../utils/commonFunctions")
let { setOtpUsingNodemailer } = require("../utils/nodemailer")
const {successResponse, errorResponse} = require('../utils/responseHandler')
let bcrypt = require('bcrypt')
let AWS = require('../utils/awsUpload')
require('dotenv').config();



exports.testRoute = async (req, res) => { res.send('test route successfull..') }


exports.signUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        let isUsernameAlreadyExist = await userModel.findOne({ username });
        if (isUsernameAlreadyExist) { return res.status(400).json(errorResponse('This username is already taken. Please try with another username.')); }

        let isEmailAlreadyExist = await userModel.findOne({ email });
        if (isEmailAlreadyExist) { return res.status(400).json(errorResponse('This email is already taken. Please try with another email.')); }

        let hashedPassword = await generateEncryptedPassword(password);
        let userDetailsObj = {
            username,
            email,
            password: hashedPassword
        };

        await userModel.create(userDetailsObj);
        return res.status(200).json(successResponse("User registered successfully."));
    } catch (error) {
        console.log('ERROR:: ', error);
        return res.status(500).json(errorResponse(error.message));
    }
};



exports.signIn = async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;

        let isUserExist = await userModel.findOne({ $or: [{ 'username': usernameOrEmail }, { 'email': usernameOrEmail }] });
        if (!isUserExist) { return res.status(400).json(errorResponse("User doesn't exist with this username or email.")); }

        let isPasswordMatched = await comparePassword(password, isUserExist.password);
        if (!isPasswordMatched) { return res.status(400).json(errorResponse("Password doesn't match.")); }

        let token = await generateToken(isUserExist._id);
        let userObj = isUserExist.toObject();
        userObj.token = token;

        await userModel.findOneAndUpdate({email:isUserExist.email},{$set:{token:token}})

        return res.status(200).json( successResponse("Logged in successfully.",userObj) );
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error.", type: 'error', error: error.message });
    }
};




exports.forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
     
        let isEmailExist = await userModel.findOne({ email });
        if (!isEmailExist) { return res.status(400).json(errorResponse("This email is not registered.")); }

        let code = await generateOTP();
        let nodemailerResponse = await setOtpUsingNodemailer(code, email);
        if (!nodemailerResponse) { return res.status(400).json(errorResponse("Something went wrong while sending email using nodemailer.")); }

        await userModel.findOneAndUpdate({ email }, {
            $set: {
                forgetPasswordOtp: code,
                forgetPasswordOtpSentAt: new Date()
            }
        });

        return res.status(200).json(successResponse(`OTP has been sent to your email ${email}. Valid for 2 minutes.`));
    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(error.message));
    }
};



exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        let isEmailExist = await userModel.findOne({ email });
        if (!isEmailExist) { return res.status(400).json(errorResponse("This email is not registered.")); }

        var OTP_created_At = new Date(isEmailExist.forgetPasswordOtpSentAt);
        let current_Time = new Date();
        let otp_time = parseInt(Math.abs(current_Time.getTime() - OTP_created_At.getTime()) / 1000);
        if (otp_time > 120) { return res.status(400).json(errorResponse("OTP expired")); }

        if (!(isEmailExist.forgetPasswordOtp === otp)) { return res.status(400).json(errorResponse("You are entering incorrect OTP")); }

        await userModel.findOneAndUpdate({ email }, {
            $set: {
                forgetPasswordOtp: null,
                forgetPasswordOtpVerified: true
            }
        });
        return res.status(200).json(successResponse("OTP verified successfully."));
    } catch (error) {
        console.log('ERROR::', error);
        return res.status(500).json(errorResponse(error.message));
    }
};



exports.resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        let isEmailExist = await userModel.findOne({ email });
        if (!isEmailExist) { return res.status(400).json(errorResponse("This email is not registered.")); }

        if (!(isEmailExist.forgetPasswordOtpVerified === true)) { return res.status(400).json(errorResponse("You cannot change password without otp verification.")) }
        let hashedPassword = await generateEncryptedPassword(password);

        await userModel.findOneAndUpdate({ email }, {
            $set: {
                password: hashedPassword
            }
        });

        return res.status(200).json(successResponse("Password reset successfully."));

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(error.message));
    }
};




exports.socialLogin = async (req, res) => {
    try {
        const { providerName, providerId, email } = req.body;

        let user = await userModel.findOne({
            email: email,
            'socialLogin.providerName': providerName,
            'socialLogin.providerId': providerId
        });

        if (!user) {
            let isUserExistwithThisEmail = await userModel.findOne({ email: email });
            if (isUserExistwithThisEmail) {
                user = await userModel.findOneAndUpdate({ email: email }, {
                    $push: {
                        socialLogin: {
                            providerName: providerName,
                            providerId: providerId
                        }
                    }
                }, { new: true });
            } else {
                user = new userModel({
                    email: email,
                    password:"demopAssword",
                    socialLogin: [{
                        providerName: providerName,
                        providerId: providerId,
                       
                    }]
                });

                await user.save();
            }
        }

        const token = await generateToken(user._id);

        return res.status(200).json({ message: "LoggedIn", type: "success", token: token });
    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(error.message));
    }
};




exports.changePassword = async(req,res)=>{
    try{
      let id = req.result.id;
      let password = req.body.password;
      let newPassword = req.body.newPassword

      let userDetails = await userModel.findOne({_id:id})
      if(!userDetails){return res.status(400).json(errorResponse("loggedIn user not found"))}

      let isPassCorrect = await bcrypt.compare(password,userDetails.password)
      if(!isPassCorrect){return res.status(400).json(errorResponse("Entered current password is not correct"))}
    
      let salt = await bcrypt.genSalt(10);
      let passhash = await bcrypt.hash(newPassword, salt)
      await userModel.findOneAndUpdate({ _id: id }, {
          $set: {
            password: passhash,
          }
      })
      return res.status(200).json(successResponse("Password changed successfully."))
    }catch(error){
        console.log("ERROR",error)
        return res.status(500).json(errorResponse(error.message))
    }
}




exports.updateProfile = async(req,res)=>{
    try{
     let userId = req.result.id
     let email  = req.body.email
     let profileUrl = req.body.profile

     let profile = ''

     let isUserExist = await userModel.findOne({_id:userId})
     if(!isUserExist){return res.status(400).json(errorResponse("User doesn't exist with this ID.")) }

     let isEmailExist = await userModel.findOne({email:email})
     if(!(email === isUserExist.email)) {  if(isEmailExist){return res.status(400).json(errorResponse("This email is already exist. Please try another email."))}} 
    

     if (req.files && req.files.profile) {
        let file = req.files.profile
        if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg") {
            const profilePath = `UserProfile/${userId}`;
            const contentType = file.mimetype;
            const url = await AWS.uploadS3(file, profilePath, contentType);
            profile = url;
        } else { return res.status(400).json(errorResponse("This format not allowed in the profile. Please add a image having format jpg,png,jpeg"))}
    }


    await userModel.findOneAndUpdate({_id:userId},{
        $set:{
            email:email,
            profile:profile?profile:profileUrl
        }
     })
   
    return res.status(200).json(successResponse("User updated successfully."))
     
    }catch(error){
        console.log("ERROR:: ",error)
        return res.status(500).json(errorResponse(error.message))
    }
}



exports.getUserProfile = async (req, res) => {
    try {
        let userId = req.result.id;
        let isUserExist = await userModel.findOne({ _id: userId });

        if (!isUserExist) { return res.status(400).json(errorResponse("User does not exist")); }

        const { _id, username,email, profile } = isUserExist;
        const userData = { _id, username, email, profile };

        return res.status(200).json({ userData, type: 'success' });
    } catch (error) {
        console.log('ERROR:: ', error);
        return res.status(500).json(errorResponse(error.message));
    }
};
