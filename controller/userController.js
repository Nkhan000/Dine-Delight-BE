const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys().forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = allowedFields[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    users,
  });
});
