const Reservation = require('./../models/reservationModel');
const Cuisine = require('./../models/cuisineModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// const mongoose = require('mongoose');
const APIFeatures = require('../utils/apiFeatures');
const User = require('../models/userModel');
const sendEmail = require('../utils/emailHandler');

// GET ALL RESERVATIONS FOR ADMIN
exports.getAllReservations = catchAsync(async (req, res, next) => {
  // if (req.user.role !== 'admin')
  //   return next(new AppError('You are not allowed perform this task', 401));
  // const reservationsData = await Reservation.find();

  res.status(200).json({
    status: 'success',
    // data: {
    //   reservationsData,
    // },
  });
});

// GET ALL RESERVATIONS FOR BUSINESS
/*
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
});*/

// GET OR FIND A RESERVATION BY ID
/*
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
});*/

exports.sendVerificationCode = catchAsync(async (req, res, next) => {
  const user = req.user;
  const randomCode = Math.floor(Math.random() * 1_000_000);
  user.reservationOTP = randomCode;
  user.reservationOTPCreatedAt = Date.now();

  const message = `This is your SECURITY CODE to verify your reservation. Do not share this with anyone. ${randomCode}`;
  await Promise.all([
    user.save({ validateBeforeSave: false }),
    sendEmail({
      email: user.email,
      subject:
        'DineDelight : Verification code for reservation (VALID FOR 10 MINS)',
      message,
    }),
  ]);

  res.status(201).json({
    status: 'success',
    message: `verification code was sent`,
  });
});

exports.verifyVerificationCode = catchAsync(async (req, res, next) => {
  const user = req.user;
  const savedCode = user.reservationOTP;

  const receivedCode = req.body.OTPCode;

  if (savedCode === 0) {
    return next(
      new AppError('Your OTP code has expired. Try Again with new one', 403),
    );
  }
  if (receivedCode !== savedCode) {
    return next(
      new AppError(
        `OTP code did not matched : ${receivedCode} : ${savedCode}`,
        403,
      ),
    );
  }

  user.reservationOTP = 0;
  user.reservationOTPCreatedAt = 0;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
  });
});
// RESERVATION OPTIONS CONTROLLER //
exports.addPartySize = catchAsync(async (req, res, next) => {
  const user = req.user;
  const cuisine = await Cuisine.findById(user.cuisineId);
  if (!cuisine) {
    return next(
      new AppError('No Cuisine for given user was found. Try again !!', 404),
    );
  }

  const newPartySize = req.body.partySize;
  const typeofOp = req.body.typeOfOp;
  const maximumSize = Math.max(
    ...cuisine.reservationPartySizeOptions.map(Number),
  );

  if (newPartySize > 0 && newPartySize <= maximumSize) {
    if (typeofOp === 'add') {
      await Cuisine.findByIdAndUpdate(user.cuisineId, {
        $addToSet: { reservationPartySizeOptions: newPartySize },
      });
    } else if (typeofOp === 'remove') {
      await Cuisine.findByIdAndUpdate(user.cuisineId, {
        $pull: { reservationPartySizeOptions: newPartySize },
      });
    } else {
      return next(new AppError('No type of operation was provided', 400));
    }
  } else {
    return next(new AppError('Invalid party size Provided', 400));
  }

  res.status(200).json({
    status: 'success',
  });
});

exports.addTableType = catchAsync(async (req, res, next) => {
  const user = req.user;
  const cuisine = await Cuisine.findById(user.cuisineId);
  if (!cuisine) {
    return next(
      new AppError('No Cuisine for given user was found. Try again !!', 404),
    );
  }

  const newTableType = `${req.body.tableType}`;
  const typeOfOp = req.body.typeOfOp;

  if (newTableType.length > 0 && newTableType.length <= 100) {
    if (typeOfOp == 'add') {
      await Cuisine.findByIdAndUpdate(user.cuisineId, {
        $addToSet: { tableTypeOptions: newTableType },
      });
    } else if (typeOfOp === 'remove') {
      await Cuisine.findByIdAndUpdate(user.cuisineId, {
        $pull: { tableTypeOptions: newTableType },
      });
    } else {
      return next(new AppError('Error ! Operetion type was not provided', 500));
    }
  } else {
    return next(new AppError('Error adding new table type. Try again', 400));
  }

  res.status(200).json({
    status: 'success',
  });
});

exports.addTimeSlot = catchAsync(async (req, res, next) => {
  const user = req.user;
  const cuisine = await Cuisine.findById(user.cuisineId);
  if (!cuisine) {
    return next(
      new AppError('No Cuisine for given user was found. Try again !!', 404),
    );
  }

  const newTimeSlot = `${req.body.timeSlot}`;
  const typeOfOp = req.body.typeOfOp;

  if (newTimeSlot.length > 0 && newTimeSlot.length <= 100) {
    if (typeOfOp == 'add') {
      await Cuisine.findByIdAndUpdate(user.cuisineId, {
        $addToSet: { availaableTableReservationTimeSlots: newTimeSlot },
      });
    } else if (typeOfOp == 'remove') {
      await Cuisine.findByIdAndUpdate(user.cuisineId, {
        $pull: { availaableTableReservationTimeSlots: newTimeSlot },
      });
    } else {
      return next(new AppError('Error ! Operetion type was not provided', 500));
    }
  } else {
    return next(new AppError('Error adding new TIME SLOT. Try again', 400));
  }

  res.status(200).json({
    status: 'success',
  });
});

// --------------------------- //

// CREATE A RESERVATION IN A CUISINE
exports.createAReservation = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const randomSecurityCode = Math.floor(Math.random() * 100000);

  const newReqBody = {
    ...req.body,
    userId,
    otpCode: +randomSecurityCode,
  };
  const newReservation = await Reservation.create(newReqBody);
  const cuisine = await Cuisine.findByIdAndUpdate(req.body.cuisineId, {
    $push: { onGoingReservationsId: newReservation._id },
  });
  if (!cuisine) return next(new AppError('Error finding cuisine', 404));
  res.status(201).json({
    status: 'success',
    newReservation,
    // data: {
    // },
  });
});

// SENDS ALL THE RESERVATION OF A USER
exports.getAllReservationByUserId = catchAsync(async (req, res, next) => {
  const user = req.user;
  const allReservations = await Reservation.find({ userId: user._id });

  res.status(200).json({
    status: 'success',
    allReservations,
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
