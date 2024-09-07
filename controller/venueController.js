const BookedVenue = require('../models/bookedVenueModel');
const catchAsync = require('../utils/catchAsync');

exports.createAVenueBooking = catchAsync(async (res, res, next) => {
  const user = req.user;
  const venueObj = { ...req.body, userId: user._id };
  // const newVenueBooking = await BookedVenue.create(venueObj);
  res.status(201).json({
    status: 'success',
    message: 'New Booking has been made successfully',
    booking: venueObj,
  });
});
