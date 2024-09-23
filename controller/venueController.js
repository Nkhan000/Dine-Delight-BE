const BookedVenue = require('../models/bookedVenueModel');
const VenuesMenu = require('../models/bookingsVenueModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createAVenueBooking = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const cuisineId = req.body.cuisineId;
  const venueObj = { ...req.body, userId };
  const foundVenue = await VenuesMenu.findOne(
    {
      cuisineId,
      bookingItems: { $elemMatch: { name: venueObj.name } },
    },
    { 'bookingItems.$': 1 },
  );
  if (!foundVenue) {
    return next(new AppError('Venue with given name not found', 404));
  }

  // const selectedVenue = foundVenue.bookingItems[0];

  const newBooking = await BookedVenue.create(venueObj);

  res.status(201).json({
    status: 'success',
    message: 'New Booking has been made successfully',
    // foundVenue,
    // selectedVenue,
    newBooking,
  });
});

exports.getAVenueBookingDetail = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  // const bookedVenue = await BookedVenue.find({ userId });

  const bookedVenue = await BookedVenue.find({ userId }).populate({
    path: 'cuisineId userId',
    select: 'name address',
  });

  res.status(200).json({
    status: 'success',
    bookedVenue,
    // bookedVenue,5
  });
});

// routes to be implemented for businesses
