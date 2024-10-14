const Cuisine = require('../models/cuisineModel');
const FoodMenu = require('../models/foodItemModal');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { imageUploader } = require('./imageUploader');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const upload = imageUploader();

exports.uploadFoodMenuPhoto = upload.single('image');

exports.resizeFoodMenuPhoto = (req, res, next) => {
  if (!req.file) return next();

  // if file then resize and name the file
  req.file.filename = `${req.body.name?.split(' ')?.join('_').toLowerCase()}-${req.user._id}-${Date.now()}.jpeg`;
  // image comes in the buffer because of multer.memoryStorage
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/foodmenu/${req.file.filename}`);

  next();
};

const deleteImageFromFolder = async (fullPath) => {
  if (fs.existsSync(fullPath)) {
    try {
      await fs.promises.unlink(fullPath);
      console.log('File deleted successfully');
    } catch (err) {
      console.log('Error deleting the file:', err);
    }
  } else {
    console.log('Image path is not defined or file does not exist: Ignoring');
  }
};

const renameImageFromFolder = async (fullOldPath, fullNewPath) => {
  if (fs.existsSync(fullOldPath)) {
    try {
      await fs.promises.rename(fullOldPath, fullNewPath);
      console.log('File renamed successfully ');
    } catch (err) {
      console.log('Error renaming the image. Try again . . .');
    }
  } else {
    console.log('Image path is not defined or file does not exist: Ignoring');
  }
};

// CONTROLLER FOR ADDING A NEW ITEM TO THE FOOD MENU
exports.addNewItemToMenu = catchAsync(async (req, res, next) => {
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
  const newItemObj = req.body;

  newItemObj.prices = JSON.parse(newItemObj.prices);
  newItemObj.mainIngredients = newItemObj.mainIngredients.split(',');

  if (req.file) {
    newItemObj.image = `img/foodmenu/${req.file.filename}`;
  }

  const updatedFoodMenu = await FoodMenu.findOneAndUpdate(
    { cuisineId: cuisine._id },
    {
      $push: { foodItems: newItemObj }, // pushes the new item object to the items Array
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
  const foodMenu = await FoodMenu.findOne({
    cuisineId: cuisine._id,
    foodItems: {
      $elemMatch: { _id: new mongoose.Types.ObjectId(req.body.itemId) },
    },
  });
  if (!foodMenu) {
    return next(new AppError('No food menu found for this user', 404));
  }

  const removedItemCategory = req.body.itemCategory;
  const idToRemove = req.body.itemId;

  const itemToBeRemoved = foodMenu.foodItems.filter(
    (item) => item._id.toString() === idToRemove,
  )[0];

  const fullImgPath = path.join(
    __dirname,
    '..',
    'public',
    itemToBeRemoved.image,
  );

  let updatedMenu = await FoodMenu.findOneAndUpdate(
    { cuisineId: cuisine._id },
    { $pull: { foodItems: { _id: { $in: idToRemove } } } }, // $in to see if the ids is inside the array, for single value like string {_id : strVal}
    { new: true },
  );

  // SEE if the category of the removed Item is still in the menu
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

  deleteImageFromFolder(fullImgPath);

  res.status(200).json({
    status: 'success',
    message: `food item(s) from menu has been removed`,
    foodMenu: updatedMenu,
  });
});

exports.updateItemsFromMenu = catchAsync(async (req, res, next) => {
  const user = req.user;
  const cuisine = await Cuisine.findOne({ userId: user._id });
  const foodMenu = await FoodMenu.findOne({
    cuisineId: cuisine._id,
    foodItems: {
      $elemMatch: { _id: new mongoose.Types.ObjectId(req.body.itemId) },
    },
  });

  if (!foodMenu) {
    return next(new AppError('No food menu for given item was found', 404));
  }

  const itemToBeUpdated = foodMenu.foodItems.filter(
    (item) => item._id.toString() == req.body.itemId,
  )[0];

  const existingImagePath = itemToBeUpdated.image;
  const fullPath = path.join(__dirname, '..', 'public', existingImagePath);

  const updatedItem = req.body;
  updatedItem.prices = JSON.parse(updatedItem.prices);
  updatedItem.mainIngredients = updatedItem.mainIngredients.split(',');

  if (req.file) {
    deleteImageFromFolder(fullPath);
    updatedItem.image = `img/foodmenu/${req.file.filename}`;
  } else if (!req.file && itemToBeUpdated.name !== updatedItem.name) {
    const oldPath = itemToBeUpdated.image;
    const fullOldPath = path.join(__dirname, '..', 'public', oldPath);

    const newPath = oldPath.replace(
      itemToBeUpdated.name.split(' ').join('_'),
      updatedItem.name.split(' ').join('_'),
    );
    const fullNewPath = path.join(__dirname, '..', 'public', newPath);

    renameImageFromFolder(fullOldPath, fullNewPath);
    updatedItem.image = newPath;
  }

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
