const Reservation = require('./../models/reservationModel');
const Cuisine = require('./../models/cuisineModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// const mongoose = require('mongoose');
const APIFeatures = require('../utils/apiFeatures');

// GET ALL RESERVATIONS FOR ADMIN
exports.getAllReservations = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'admin')
    return next(new AppError('You are not allowed perform this task', 401));
  const reservationsData = await Reservation.find();

  res.status(200).json({
    status: 'success',
    data: {
      reservationsData,
    },
  });
});

// GET ALL RESERVATIONS FOR BUSINESS
exports.getAllReservationsForBussiness = catchAsync(async (req, res, next) => {
  const cuisineId = req.params.id;
  // console.log(cuisineId === req.user._id);

  const reservationsData = Reservation.find({
    cuisineId: { $eq: cuisineId },
  });

  const reservationsWithApiFeatures = new APIFeatures(
    reservationsData,
    req.query,
  )
    .filter()
    .limitFields()
    .sort()
    .pagination();

  // Total number of pages
  const allReservations = await reservationsWithApiFeatures.query;
  const reservationLength = new APIFeatures(
    Reservation.find({
      cuisineId: { $eq: cuisineId },
    }),
    req.query,
  )
    .sort()
    .limitFields()
    .filter();

  const reservationsLengthQuery = await reservationLength.query;

  res.status(200).json({
    status: 'success',
    results: allReservations.length,
    totalDocsLength: reservationsLengthQuery.length,
    data: {
      allReservations,
    },
  });
});

// GET OR FIND A RESERVATION BY ID
exports.getAReservation = catchAsync(async (req, res, next) => {
  // Should only be accessible by admin, cuisine owner and customer
  // must not be accessible by other cuisines or customer

  const reservation = await Reservation.findById(
    req.params.reservationId,
  ).populate({
    path: 'cuisineId userId',
    select: 'name address email',
  });
  // Clause to only make the reservation details accessed by customer who made it and by cuisine owner
  if (
    !req.user._id.equals(reservation.userId._id) &&
    !req.user._id.equals(reservation.cuisineId._id)
  ) {
    return next(
      new AppError('You are not allowed to perform this action', 401),
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      reservation,
    },
  });
});

// CREATE A RESERVATION IN A CUISINE
exports.createAReservation = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const cuisineId = req.params.id;
  const cuisine = await Cuisine.findById(cuisineId);

  const allReservations = await Reservation.find({ userId });
  if (allReservations.length > 1) {
    return next(
      new AppError(
        'You can not make multiple reservations at a same time. Go to our /FAQ page for more info',
        403,
      ),
    );
  }
  // Random 4 digit security code
  const randomSecurityCode = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  const newReqBody = {
    ...req.body,
    cuisineId,
    userId,
    securityCode: +randomSecurityCode,
  };

  cuisine.numberOfReservations += 1;
  await cuisine.save();

  const newReservation = await Reservation.create(newReqBody);
  res.status(201).json({
    status: 'success',
    data: {
      newReservation,
    },
  });
});

// VERIFY/CANCEL A RESERVATION BY RESERVATION ID

exports.verifyReservation = catchAsync(async (req, res, next) => {
  // this function has to verify whether the customer has arrived or canceled their reservation
  const reservation = await Reservation.findById(
    req.params.reservationId,
  ).populate({
    path: 'userId',
    select: 'name',
  });
  // validate reservation
  if (!reservation) {
    return next(new AppError('Reservation not found', 404));
  }
  // Validate reservation status based on requested action
  const isCancellationRequest = req.body.status === 'canceled';
  if (reservation.hasCheckedIn === null && !isCancellationRequest) {
    return next(new AppError('Reservation has been cancelled recently', 405));
  } else if (reservation.hasCheckedIn && !isCancellationRequest) {
    return next(new AppError('Customer has already arrived', 405));
  }

  // validating security code
  if (req.body.securityCode !== reservation.securityCode)
    return next(new AppError('Wrong security code provided', 401));

  // validating statuses
  const allowedStatuses = ['canceled', 'arrived'];
  if (!allowedStatuses.includes(req.body.status))
    return next(new AppError('Invalid status provided', 401));

  reservation.status = req.body.status;
  reservation.hasCheckedIn = isCancellationRequest ? null : true;
  await reservation.save();
  res.status(200).json({
    status: 'success',
    message:
      req.body.status == 'canceled'
        ? 'Customer canceled their reservation'
        : 'Customer has arrived',
    reservation,
  });
});
