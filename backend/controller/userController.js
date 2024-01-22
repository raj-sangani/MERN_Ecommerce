const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");


//regsiter USer
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is a sample id",
      url: "profilepic.jpg",
    },
  });
  
  if(!user){
    return next(new ErrorHandler('User not Created',404));
  }

  sendToken(user, 201, res);
});


//login user
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password} = req.body;
    //check if email and password is entered by user
    if(!email || !password){
        return next(new ErrorHandler('Please enter email and password',400));
    }
    //finding user in database
    const user = await User.findOne({email}).select('+password');
    if(!user){
        return next(new ErrorHandler('Invalid Email or Password',401));
    }
    //check if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler('Invalid Email or Password',401));
    }

    const token = user.getJWTToken();
    sendToken(user, 200, res);
});

//logout user
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token',null,{
        expires:new Date(Date.now()),
        httpOnly:true
    });
    res.status(200).json({
        success:true,
        message:'Logged Out'
    });
});

//forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({email:req.body.email});
  if(!user){
      return next(new ErrorHandler('User not found with this email',404));
  }

  //get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({validateBeforeSave:false});

  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
  const message = `Your password reset token is as follows:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;

  try{

    await sendEmail({
        email:user.email,
        subject:'Ecommernce Password Recovery',
        message
    });

    res.status(200).json({
        success:true,
        message:`Email sent to ${user.email} successfully`
    });
  }catch(error){
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({validateBeforeSave:false});

      return next(new ErrorHandler(error.message,500));
  }

});