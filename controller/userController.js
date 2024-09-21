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
  const deliveryOrders = await Delivery.find({ userId })
    .select('deliveryDate type total cuisineId remarks -_id')
    .populate({
      path: 'cuisineId',
      select: 'name -_id',
    });

  const reservationOrders = await Reservation.find({ userId })
    .select('reservationDate type total cuisineId remarks -_id')
    .populate({
      path: 'cuisineId',
      select: 'name -_id',
    });
  const bookedVenueOrders = await BookedVenue.find({ userId })
    .select('venueBookingStartDate type total cuisineId remarks -_id')
    .populate({
      path: 'cuisineId',
      select: 'name -_id',
    });

  const ordersArr = [
    ...deliveryOrders,
    ...reservationOrders,
    ...bookedVenueOrders,
  ];

  const totalOrdersArr = ordersArr.sort((a, b) => {
    // Get the date for sorting - prefer 'deliveryDate', fallback to 'reservationDate'
    const dateA = new Date(a.deliveryDate || a.reservationDate).getTime();
    const dateB = new Date(b.deliveryDate || b.reservationDate).getTime();

    // If both dates are missing, consider them equal
    if (!a.deliveryDate && !a.reservationDate) return 1;
    if (!b.deliveryDate && !b.reservationDate) return -1;

    // Sort in descending order (most recent first)
    return dateB - dateA;
  });

  res.status(200).json({
    status: 'success',
    // deliveryOrders,
    totalOrdersArr,
  });
});
