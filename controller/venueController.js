const BookedVenue = require('../models/bookedVenueModel');
const VenuesMenu = require('../models/bookingsVenueModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Cuisine = require('../models/cuisineModel');
const { imageUploader } = require('./imageUploader');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { default: mongoose } = require('mongoose');

const deleteImageFromFolder = (imgsArr) => {
  const fullPathArr = imgsArr.map((img) =>
    path.join(__dirname, '..', 'public', img),
  );
  fullPathArr.forEach(async (fullPath) => {
    if (fs.existsSync(fullPath)) {
      try {
        await fs.promises.unlink(fullPath);
        console.log('File deleted successfully');
      } catch (err) {
        throw new AppError('Error deleting the image', 403);
      }
    } else {
      throw new AppError(
        'Image path is not defined or file does not exist: Ignoring',
        403,
      );
    }
  });
};

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
  const venuesMenu = await VenuesMenu.findOne({ cuisineId: cuisine._id });

  res.status(200).json({
    status: 'success',
    venuesMenu,
  });
});

// VENUES CONTROLLLERS BUSINESS
// -------------------- MIDDLEWARES ----------------------
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
// -------------------- MIDDLEWARES ----------------------

exports.addANewVenueItem = catchAsync(async (req, res, next) => {
  const user = req.user;
  const cuisineId = user.cuisineId;
  const venuesMenu = await VenuesMenu.findOne({ cuisineId });
  if (!venuesMenu)
    return next(new AppError('No bookings menu found for given cuisine', 404));

  const newVenueItem = req.body;
  newVenueItem.images = [];

  if (req.files && req.files.length > 0) {
    req.files.map((file) =>
      newVenueItem.images.push(`img/venuemenu/${file.filename}`),
    );
  }
  const updatedMenu = await VenuesMenu.findOneAndUpdate(
    { cuisineId: cuisineId },
    {
      $push: { venueItems: newVenueItem },
      $addToSet: { partySizeArr: newVenueItem.aprPartySize },
    },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    result: updatedMenu,
  });
});

exports.removeAVenueItem = catchAsync(async (req, res, next) => {
  const user = req.user;
  const cuisineId = user.cuisineId;
  const venuesMenu = await VenuesMenu.findOne({ cuisineId });

  if (!venuesMenu) {
    return next(
      new AppError('No venue for the given item was found. Try again !!'),
    );
  }

  const IDToBeRemoved = req.body.venueId;
  const existingPartySize = req.body.aprPartySize;
  const itemImgPath = req.body.images;

  // const fullImagePath = path.join(__dirname, '..', 'public', itemImgPath);

  let updatedMenu = await VenuesMenu.findOneAndUpdate(
    { cuisineId: cuisineId },
    { $pull: { venueItems: { _id: IDToBeRemoved } } },
    { new: true },
  );

  const partySizeStillExist = updatedMenu.venueItems.some(
    (item) => item.aprPartySize == existingPartySize,
  );

  if (!partySizeStillExist) {
    updatedMenu = await VenuesMenu.findOneAndUpdate(
      { cuisineId: cuisineId },
      { $pull: { partySizeList: existingPartySize } },
      { new: true },
    );
  }
  // fullPathArr.forEach((item) => deleteImageFromFolder(item));
  deleteImageFromFolder(itemImgPath);

  res.status(200).json({
    status: 'success',
    updatedMenu,
  });
});

exports.updateAVenueItem = catchAsync(async (req, res, next) => {
  const user = req.user;
  const venuesMenu = await VenuesMenu.findOne({
    cuisineId: user.cuisineId,
    'venueItems._id': new mongoose.Types.ObjectId(req.body.itemId),
  });

  if (!venuesMenu)
    return next(
      new AppError(
        'No venue menu was found for the given item. Try again',
        404,
      ),
    );

  res.status(200).json({
    status: 'success',
  });
});

exports.removeSelectedImages = catchAsync(async (req, res, next) => {
  const user = req.user;
  const images = req.body.images;
  const itemId = req.body.itemId;
  const venueMenu = await VenuesMenu.findOne({
    cuisineId: user.cuisineId,
    'venueItems._id': new mongoose.Types.ObjectId(itemId),
  });

  if (!venueMenu)
    return next(
      new AppError(
        'No Venue Menu was found for the given item. Try again !!',
        404,
      ),
    );

  const validImagesToDelete = images.every(
    (img) =>
      img.includes('venuemenu') &&
      img.split('-')[1].toString() == user._id.toString(),
  );

  if (validImagesToDelete) {
    deleteImageFromFolder(images);

    await VenuesMenu.findOneAndUpdate(
      { cuisineId: user.cuisineId, 'venueItems._id': itemId },
      {
        $pull: {
          'venueItems.$.images': { $in: images }, // Use positional operator $ to target specific venueItem
        },
      },
    );
  }

  res.status(200).json({
    status: 'success',
  });
});
