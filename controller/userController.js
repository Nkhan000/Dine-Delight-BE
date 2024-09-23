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

  const [deliveryOrders, reservationOrders, bookedVenueOrders] =
    await Promise.all([
      Delivery.find({ userId })
        .select('deliveryDate type total cuisineId remarks -_id')
        .populate({
          path: 'cuisineId',
          select: 'name -_id',
        }),

      Reservation.find({ userId })
        .select('reservationDate type total cuisineId remarks -_id')
        .populate({
          path: 'cuisineId',
          select: 'name -_id',
        }),
      BookedVenue.find({ userId })
        .select('venueBookingStartDate type total cuisineId remarks -_id')
        .populate({
          path: 'cuisineId',
          select: 'name -_id',
        }),
    ]);

  const ordersArr = [
    ...deliveryOrders,
    ...reservationOrders,
    ...bookedVenueOrders,
  ];

  const totalOrdersArr = ordersArr.sort((a, b) => {
    const dateA = new Date(
      a.deliveryDate ?? a.reservationDate ?? a.venueBookingStartDate,
    ).getTime();
    const dateB = new Date(
      b.deliveryDate ?? b.reservationDate ?? b.venueBookingStartDate,
    ).getTime();
    return dateB - dateA; // Sort by most recent date
  });
  res.status(200).json({
    status: 'success',
    totalOrdersArr,
    totalDeliveryOrders: deliveryOrders.length,
    highestDelivery: deliveryOrders.reduce(
      (acc, cur) => (acc < cur.total ? cur.total : acc),
      0,
    ),
    totalReservationOrders: reservationOrders.length,
    highestReservation: reservationOrders.reduce(
      (acc, cur) => (acc < cur.total ? cur.total : acc),
      0,
    ), // returns the orders with highest cost
    totalVenueOrders: bookedVenueOrders.length,
    highestVenueBooking: bookedVenueOrders.reduce(
      (acc, cur) => (acc < cur.total ? cur.total : acc),
      0,
    ), // returns the orders with highest cost
  });
});

// Business user routes for overall cuisine operations - accept/reject/operations
