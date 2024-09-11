const BookedVenue = require('../models/bookedVenueModel');
const VenuesMenu = require('../models/bookingsVenueModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createAVenueBooking = catchAsync(async (req, res, next) => {
  const user = req.user;
  const bookedVenue = await BookedVenue.findOne({ userId: user.id });

  if (bookedVenue) {
    return next(new AppError('User already have pending venue booking', 403));
  }
  const venueObj = { ...req.body, userId: user._id };
  const cuisineId = req.body.cuisineId;
  const venueId = req.body.venueId;
  const foundVenue = await VenuesMenu.findOne({
    cuisineId,
  });
  const bookingItem = foundVenue.bookingItems.filter(
    (item) => item.id === venueId,
  );

  if (!bookingItem) {
    return next(new AppError('No such venue was found, Try Again', 404));
  }

  const newBookingItem = await BookedVenue.create(venueObj);
  await newBookingItem.save();
  res.status(201).json({
    status: 'success',
    message: 'New Booking has been made successfully',
    newBooking: newBookingItem,
    // venue,
  });
});

exports.getAVenueBookingDetail = catchAsync(async (req, res, next) => {
  const user = req.user;
  const bookedVenue = await BookedVenue.findOne({ userId: user.id }).populate({
    path: 'cuisineId userId',
    select: 'name',
  });

  res.status(200).json({
    status: 'success',
    bookedVenue,
  });
});
