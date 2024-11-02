const Cuisine = require('../models/cuisineModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { imageUploader } = require('./imageUploader');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const upload = imageUploader(15);

exports.uploadHighlightImages = upload.array('highlights', 10);

exports.resizeHighlightImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  req.files = await Promise.all(
    req.files.map(async (file, idx) => {
      const filename = `highlight-${req.user._id}-${Date.now()}-${idx}.jpeg`;

      await sharp(file.buffer)
        .resize(550, 550)
        .toFormat('jpeg')
        .jpeg({ quality: 95 })
        .toFile(`public/img/highlights/${filename}`);

      return {
        ...file,
        filename, // Store the filename for later use
      };
    }),
  );
  next();
};

exports.uploadHighlights = catchAsync(async (req, res, next) => {
  const user = req.user;
  const cuisine = await Cuisine.findById(user.cuisineId);

  if (!cuisine) {
    return next(new AppError('No cuisine was found', 404));
  }

  if (cuisine.highlightImages.length >= 15) {
    return next(
      new AppError('Maximum numbers of highlights has been uploaded', 401),
    );
  }
  const newImagesArr = [];
  if (req.files || req.files.length > 0) {
    req.files.map((file) => {
      newImagesArr.push(`img/highlights/${file.filename}`);
    });
  }

  const updatedCuisine = await Cuisine.findOneAndUpdate(
    { _id: user.cuisineId },
    {
      $push: { highlightImages: { $each: newImagesArr } },
    },
    {
      new: true,
    },
  );

  if (!updatedCuisine) {
    return next(new AppError('error uploading highlights. Try again', 401));
  }

  res.status(200).json({
    status: 'success',
    message: 'Added highlights successfully',
  });
});
const deleteImageFromFolder = async (imgsArr) => {
  const fullPathArr = imgsArr.map((img) =>
    path.join(__dirname, '..', 'public', img),
  );
  for (const fullPath of fullPathArr) {
    if (fs.existsSync(fullPath)) {
      try {
        await fs.promises.unlink(fullPath);
      } catch (err) {
        throw new AppError('Error deleting the image', 403);
      }
    } else {
      throw new AppError(
        'Image path is not defined or file does not exist: Ignoring',
        403,
      );
    }
  }
};
exports.removeHighlights = catchAsync(async (req, res, next) => {
  const user = req.user;
  const cuisine = await Cuisine.findById(user.cuisineId);

  if (!cuisine) {
    return next(new AppError('No cuisine was found', 404));
  }

  const imagesArr = req.body.images;

  await deleteImageFromFolder(imagesArr);

  const updatedCuisine = await Cuisine.findOneAndUpdate(
    { _id: user.cuisineId },
    {
      $pull: { highlightImages: { $in: imagesArr } },
    },
    {
      new: true,
    },
  );

  if (!updatedCuisine) {
    return next(new AppError('error removing highlights. Try again', 400));
  }

  res.status(200).json({
    status: 'success',
    message: 'Removed highlights successfully',
  });
});
