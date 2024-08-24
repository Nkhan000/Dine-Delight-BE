const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.verifyBusinessUserOAF = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'admin')
    return next(new AppError('You are not allowed to perform this task', 401));
  const userToVerify = await User.findById(req.params.userId);
  if (!userToVerify) return next(new AppError('User not found', 404));
  if (userToVerify.verified)
    return next(new AppError('User has already been verified', 409));
  userToVerify.verified = true;
  await userToVerify.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'A User was verified',
    data: userToVerify,
  });
});

exports.verifyCuisineOAF = catchAsync(async (req, res, next) => {});

exports.deleteCusineOAF = catchAsync(async (req, res, next) => {});

exports.sendNoticeToAllUsers = catchAsync(async (req, res, next) => {});

exports.sendNoticeToASingleUser = catchAsync(async (req, res, next) => {});
