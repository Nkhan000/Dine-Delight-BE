const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
// require('./OAuthController');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/emailHandler');
const createJWTToken = require('../utils/createJWTToken');
const session = require('express-session');
// const passport = require('passport');
// require('dotenv').config();

const createAndSendToken = (user, statusCode, res) => {
  const token = createJWTToken.signToken(user._id);
  res.setHeader('Authorization', `Bearer ${token}`);
  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    user,
  });
};

// CREATING SESSIONS SHOULD BE ON CLIENT SIDE;
//CREATE A FUNCTION TO GET USER DATA AFTER LOGIN IS COMPLETE BASED ON TOKEN SAVED IN LOCAL STORAGE

// exports.setCookies = catchAsync(async (req, res, next) => {
//   const cookieValue = req.params.cookieVal;
//   cookieOptions = {
//     maxAge: 1000 * 60 * 60,
//     httpOnly: true,
//     sameSite: 'lax', //CSRF protection
//   };
//   res.cookie('jwt', cookieValue, cookieOptions);
//   res.send('cookie has been set');
// });

const getUserDataFromJwt = async (token, next) => {
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user was deleted after the token was issued
  const currUser = await User.findById(decode.id);
  if (!currUser) {
    return next(
      new AppError('User belonging to this TOKEN does not exist', 401),
    );
  }

  // Check if the password was changed in the mean time
  // console.log(currUser.passwordChangedAfter(decode.iat));
  if (currUser.passwordChangedAfter(decode.iat)) {
    return next(
      new AppError('Password was changed recently. Please login again', 401),
    );
  }
  return currUser;
};

exports.signup = catchAsync(async (req, res, next) => {
  if (req.body.role === 'admin') {
    return next(
      new AppError('You can only set your role to user or business', 403),
    );
  }
  const reqBody = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    image: './img/person-002.jpg',
    hasCuisine: false,
  };
  // if (req.body.role === 'business') {
  //   reqBody.verified = false;
  //   await User.create(reqBody);

  //   res.status(200).json({
  //     status: 'success',
  //     message:
  //       "You're account is under verification. This might take upto 48hours. We will notify you when done",
  //   });
  // } else {
  //   // console.log(req.session);
  // }
  const newUser = await User.create({ ...reqBody, verified: true });
  // await newUser.save();

  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password is ggiven
  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  //Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  // comparing the given password with saved password
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError('Email or password is incorrect. Please try again', 401),
    );
  }

  // If everything okay then send a JWT token to the user
  createAndSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You are not logged in. Please login to get access', 401),
    );
  }

  // // VERIFICATION OF TOKEN
  // // synchronus way of verification
  // // const decode = jwt.verify(token, process.env.JWT_SECRET);
  // const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // // Check if user was deleted after the token was issued
  // const currUser = await User.findById(decode.id);
  // if (!currUser) {
  //   return next(
  //     new AppError('User belonging to this TOKEN does not exist', 401),
  //   );
  // }

  // // Check if the password was changed in the mean time
  // // console.log(currUser.passwordChangedAfter(decode.iat));
  // if (currUser.passwordChangedAfter(decode.iat)) {
  //   return next(
  //     new AppError('Password was changed recently. Please login again', 401),
  //   );
  // }
  const currUser = await getUserDataFromJwt(token, next);
  // ALLOW ACCESS TO THE PROTECTED ROUTE
  req.user = currUser;
  // console.log(req.user);
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not authorized to perform this action', 401),
      );
    }
    next();
  };
};

exports.getUserData = catchAsync(async (req, res, next) => {
  const currUser = req.user;
  res.status(200).json({
    status: 'success',
    data: {
      user: currUser,
    },
  });
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // Get user based on provided email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user with the given email was found', 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/user/reset-password/${resetToken}`;

  const message = `Forgot your password. Click on the link below to reset your password. Please ignore this message if you have not forgotten your password.\nLINK : ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token (VALID FOR 10 MINS)',
      message,
    });
    console.log(message);
    res.status(200).json({
      status: 'success',
      message: 'Reset Token was sent to your email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);
    return next(
      new AppError(
        'An Error occured while sending the email. Please try again',
        500,
      ),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('reset token has expired. Please try again', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  await user.save();

  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(
      new AppError("Current password didn't match. Please try again"),
    );
  }
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createAndSendToken(user, 200, res);
});

// TODO
// DISTINGUISH LOGIN FUNCTIONALITY FOR INDIVIDUAL AND BUSINESSES
// OAuth 2.0 implementation - 50% done
// XSS PROTECTION - DONE
// CSRF PROTECTION
// NoSQL INJECTON PROTECTION - DONE
