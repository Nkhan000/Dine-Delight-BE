const Cuisine = require('./../models/cuisineModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const FoodMenu = require('../models/foodItemModal');
const VenuesMenu = require('../models/bookingsVenueModel');
// const mongoose = require('mongoose');

exports.cuisineExist = catchAsync(async (req, res, next) => {
  const cuisine = await Cuisine.findById(req.params.id);
  if (!cuisine) {
    return next(new AppError('No cuisine with the ID found', 404));
  }
  next();
});

exports.getAllCuisines = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Cuisine.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const allCuisines = await features.query;

  const totalDocs = new APIFeatures(Cuisine.find(), req.query)
    .filter()
    .sort()
    .limitFields();
  const totalDocsLength = await totalDocs.query;

  res.status(200).json({
    status: 'success',
    results: allCuisines.length,
    totalDocsLength: totalDocsLength.length,
    data: {
      allCuisines,
    },
  });
});

exports.getCuisine = catchAsync(async (req, res, next) => {
  const cuisine = await Cuisine.findById(req.params.id)
    .populate({
      path: 'foodMenu',
      select: '-id -__v',
    })
    .select('-userId -__v -numberOfBookings -numberOfDeliveries');
  res.status(200).json({
    status: 'success',
    cuisineData: {
      cuisine,
      // reservations,
    },
  });
});

exports.getCuisineData = catchAsync(async (req, res, next) => {
  let cuisine;
  cuisine = await Cuisine.findById(req.params.id)
    .populate({
      path: 'foodMenu venueMenu',
      select: '-id -__v',
    })
    .select('-userId -__v -numberOfBookings -numberOfDeliveries');

  res.status(200).json({
    status: 'success',
    cuisineData: {
      cuisine,
    },
  });
});

exports.getCuisineForBusiness = catchAsync(async (req, res, next) => {
  const user = req.user;
  // console.log(req.user);
  const cuisine = await Cuisine.findById(user.cuisineId);
  res.status(200).json({
    status: 'success',
    data: cuisine,
  });
});

// for pactch request
// MORE WORKS TODO IN HERE
exports.updateCuisine = catchAsync(async (req, res, next) => {
  const updatedCuisine = await Cuisine.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(204).json({
    status: 'success',
    data: {
      updatedCuisine,
    },
  });
});

exports.createACuisine = catchAsync(async (req, res, next) => {
  const user = req.user;
  const cuisineExist = await Cuisine.findOne({ userId: user.id });
  if (cuisineExist) {
    return next(
      new AppError(
        `You already have "${cuisineExist.name}" registered under this user ID `,
      ),
    );
  }
  const newCuisine = await Cuisine.create(req.body);
  if (newCuisine.services.includes('delivery')) {
    const newFoodMenu = await FoodMenu.create({
      foodItems: [],
      cuisineId: newCuisine.id,
    });
    newCuisine.foodMenu = newFoodMenu._id;
    newCuisine.numberOfDeliveries = 0;
  }
  if (newCuisine.services.includes('venue')) {
    const newVenueMenu = await VenuesMenu.create({
      bookingItems: [],
      cuisineId: newCuisine.id,
    });
    newCuisine.venueMenu = newVenueMenu._id;
    newCuisine.numberOfReservation = 0;
  }
  newCuisine.userId = user.id;
  user.cuisineId = newCuisine.id;
  user.hasCuisine = true;
  await user.save({ validateBeforeSave: false });
  await newCuisine.save();

  // console.log(newFoodMenu);

  res.status(201).json({
    status: 'success',
    data: {
      newCuisine,
    },
  });
});

exports.deleteCuisines = catchAsync(async (req, res, next) => {
  const cuisine = await Cuisine.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// gets a cuisine by service name
exports.getService = catchAsync(async (req, res, next) => {
  const serviceName = req.params.serviceName;

  // const unwindData = Cuisine.aggregate([
  //   {
  //     $unwind: '$services',
  //   },
  //   {
  //     $match: {
  //       services: {
  //         $eq: `${serviceName}`,
  //       },
  //     },
  //   },
  //   {
  //     $sort: { ratingsAverage: -1 },
  //   },
  // ]);
  // // TODO REFACTOR
  // const data = new APIFeatures(unwindData.countDocuments(), req.query);
  // console.log(data);
  // const queryData = new APIFeatures(unwindData, req.query).sort().pagination();
  // const allCuisines = await queryData.query;

  // const totalDocs = new APIFeatures(unwindData, req.query).sort();
  // const totalDocsLength = await totalDocs.query;
  const cuisines = Cuisine.find({ services: serviceName });

  const featuredCuisines = new APIFeatures(cuisines, req.query)
    .sort()
    .filter()
    .limitFields()
    .pagination();
  const allCuisines = await featuredCuisines.query;

  const totalDocs = new APIFeatures(
    Cuisine.find({ services: serviceName }),
    req.query,
  )
    .filter()
    .sort()
    .limitFields();
  const totalDocsLength = await totalDocs.query;
  res.status(200).json({
    status: 'success',
    results: allCuisines.length,
    totalDocsLength: totalDocsLength.length,
    data: {
      allCuisines,
    },
  });
});
