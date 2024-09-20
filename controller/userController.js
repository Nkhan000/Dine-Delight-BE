const BookedVenue = require('../models/bookedVenueModel');
const Delivery = require('../models/deliveryModel');
const Reservation = require('../models/reservationModel');
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

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  // console.log(user._id);
  const deliveryOrders = await Delivery.find({ userId });

  // const reservationOrders = await Reservation.find({ userId: user._id });
  // const bookedVenueOrders = await BookedVenue.find({ userId: user._id });

  // const totalOrdersArr = [deliveryOrders, reservationOrders, bookedVenueOrders];

  res.status(200).json({
    status: 'success',
    deliveryOrders,
    // totalOrdersArr,
  });
});
