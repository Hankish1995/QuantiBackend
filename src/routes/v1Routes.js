let express = require('express')
let router = express.Router()
let userController = require('../controllers/userController')
let planController = require('../controllers/planController')
let authentication = require("../middlewares/authMiddleware")
let {
    validateRegister,
    validateSignIn,
    validateForgetPassword,
    validateVerifyOTP,
    validateResetPassword,
    validateSocialLogin,
    validateAddPlans,
    validateDeletePlan,
    validateChangePassword,
    validateUpdateProfile
} = require("../middlewares/validationMiddleware")



// ********** AUTH
router.get('/testRoute', userController.testRoute)
router.post('/signUp', validateRegister, userController.signUp)
router.post('/signIn', validateSignIn, userController.signIn)
router.post('/forgetPassword', validateForgetPassword, userController.forgetPassword)
router.post('/verifyOTP', validateVerifyOTP, userController.verifyOTP)
router.put('/resetPassword', validateResetPassword, userController.resetPassword)
router.post('/socialLogin', validateSocialLogin, userController.socialLogin)
router.put("/changePassword",authentication,validateChangePassword,userController.changePassword)
router.put("/updateProfile",authentication,validateUpdateProfile,userController.updateProfile)
router.get('/getUserProfile',authentication,userController.getUserProfile)



//**************** PLANS
router.post('/executePlan', authentication, validateAddPlans, planController.executePlan)
router.delete('/deletePlan', authentication, validateDeletePlan, planController.deletePlan)
router.get('/getAllPlans', authentication, planController.getAllPlans)
router.get('/get_plan_details',authentication,planController.get_plan_estimates)






module.exports = router