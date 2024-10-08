const Cuisine = require('./../models/cuisineModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const FoodMenu = require('../models/foodItemModal');
const VenuesMenu = require('../models/bookingsVenueModel');
const mongoose = require('mongoose');

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

exports.addItemsToMenu = catchAsync(async (req, res, next) => {
  const user = req.user;
  const cuisine = await Cuisine.findOne({ userId: user._id });
  if (!cuisine) {
    return next(new AppError('No cuisines found for the given username', 404));
  }
  const foodMenu = await FoodMenu.findOne({ cuisineId: cuisine._id });
  if (!foodMenu) {
    return next(new AppError('No food menu found for the given cuisine', 404));
  }

  // Use 'some' to check for duplicate item names
  const itemExists = foodMenu.foodItems.some(
    (item) => item.name === req.body.name.trim().toLowerCase(),
  );
  if (itemExists) {
    return next(new AppError('An item with the same name already exists', 403));
  }

  // Add new food item and save the updated menu
  // foodMenu.foodItems.push(req.body);

  const updatedFoodMenu = await FoodMenu.findOneAndUpdate(
    { cuisineId: cuisine._id },
    {
      $push: { foodItems: req.body }, // pushes the new item object to the items Array
      $addToSet: { categories: req.body.category }, // acts as a set if item already exists in the array the not add it to the category
    },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    message: 'A food item was added to the menu',
    foodMenu: updatedFoodMenu,
  });
});

exports.removeItemsFromMenu = catchAsync(async (req, res, next) => {
  const user = req.user;
  const cuisine = await Cuisine.findOne({ userId: user.id });
  const foodMenu = await FoodMenu.findOne({ cuisineId: cuisine.id });
  if (!foodMenu) {
    return next(new AppError('No food menu found for this user', 404));
  }

  const removedItemCategory = req.body.itemCategory;
  const idToRemove = req.body.itemId;

  let updatedMenu = await FoodMenu.findOneAndUpdate(
    { cuisineId: cuisine._id },
    { $pull: { foodItems: { _id: { $in: idToRemove } } } }, // $in to see if the ids is inside the array, for single value like string {_id : strVal}
    { new: true },
  );

  const isCategoryStillInTheMenu = updatedMenu.foodItems.some(
    (item) => item.category === removedItemCategory,
  );

  if (!isCategoryStillInTheMenu) {
    updatedMenu = await FoodMenu.findOneAndUpdate(
      { cuisineId: cuisine._id },
      {
        $pull: { categories: removedItemCategory },
      },
      { new: true },
    );
  }

  res.status(200).json({
    status: 'success',
    message: `food item(s) from menu has been removed`,
    foodMenu: updatedMenu,
  });
});

exports.updateItemsFromMenu = catchAsync(async (req, res, next) => {
  const user = req.user;
  const cuisine = await Cuisine.findOne({ userId: user._id });
  const foodMenu = await FoodMenu.findOne({ cuisineId: cuisine._id });
  if (!foodMenu) {
    return next(new AppError('No food menu for given was found', 404));
  }
  const updatedItem = req.body;

  let updatedMenu = await FoodMenu.findOneAndUpdate(
    {
      cuisineId: cuisine._id,
      'foodItems._id': updatedItem.itemId, // This matches the _id of the food item
    },
    {
      $set: { 'foodItems.$': updatedItem }, // The positional operator $ to update the matched item
      $addToSet: { categories: updatedItem.category },
    },
    { new: true }, // Return the updated document
  );

  const updatedFoodItems = updatedMenu.foodItems;

  // Update the `categories` array to only keep categories associated with the updated foodItems
  const currentCategories = updatedFoodItems
    .map((item) => item.category)
    .filter((category, index, self) => self.indexOf(category) === index);

  // Update the categories array in the document
  updatedMenu.categories = currentCategories;

  // Save the updated FoodMenu with the filtered categories
  await updatedMenu.save();

  res.status(200).json({
    status: 'success',
    foodMenu: updatedMenu,
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

//BOOKINGS CONTROLLLERS
exports.addVenueItem = catchAsync(async (req, res, next) => {
  const user = req.user;
  const cuisineId = user.cuisineId;
  const bookingsMenu = await VenuesMenu.findOne({ cuisineId });
  if (!bookingsMenu)
    return next(new AppError('No bookings menu found for given cuisine', 404));
  // console.log(bookingsMenu.bookingItems);

  bookingsMenu.bookingItems.push(req.body);
  await bookingsMenu.save();
  res.status(200).json({
    status: 'success',
    result: bookingsMenu,
  });
});
