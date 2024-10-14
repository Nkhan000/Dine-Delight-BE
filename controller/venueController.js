const BookedVenue = require('../models/bookedVenueModel');
const VenuesMenu = require('../models/bookingsVenueModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Cuisine = require('../models/cuisineModel');
const { imageUploader } = require('./imageUploader');
const sharp = require('sharp');
const path = require('path');

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
exports.getAllVenueDetailBS = catchAsync(async (req, res, next) => {
  const user = req.user;
  const cuisine = await Cuisine.findOne({ userId: user._id });
  const venues = await VenuesMenu.findOne({ cuisineId: cuisine._id });

  res.status(200).json({
    status: 'success',
    venues,
  });
});

// VENUES CONTROLLLERS BUSINESS
const upload = imageUploader(15);

exports.uploadVenueImage = upload.array('images', 5);

exports.resizeVenueImage = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  req.files = await Promise.all(
    req.files.map(async (file, idx) => {
      const filename = `${req.body.name.split(' ').join('_').toLowerCase()}-${req.user._id}-${Date.now()}-${idx}.jpeg`;

      await sharp(file.buffer)
        .resize(550, 550)
        .toFormat('jpeg')
        .jpeg({ quality: 95 })
        .toFile(`public/img/venuemenu/${filename}`);

      return {
        ...file,
        filename, // Store the filename for later use
      };
    }),
  );
  next();
};

exports.addANewVenueItem = catchAsync(async (req, res, next) => {
  const user = req.user;
  const cuisineId = user.cuisineId;
  const venuesMenu = await VenuesMenu.findOne({ cuisineId });
  if (!venuesMenu)
    return next(new AppError('No bookings menu found for given cuisine', 404));

  const newVenueItem = req.body;
  newVenueItem.images = [];

  if (req.files) {
    req.files.map((file) =>
      newVenueItem.images.push(`img/venuemenu/${file.filename}`),
    );
  }
  venuesMenu.venueItems.push(newVenueItem);
  await venuesMenu.save();
  res.status(200).json({
    status: 'success',
    result: venuesMenu,
  });
});
