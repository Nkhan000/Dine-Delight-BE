const ReviewAndRating = require('../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createAReview = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'user')
    return next(new AppError('Only users are allowed to post a review', 403));
  const reivewObject = {
    ...req.body,
    cuisineId: req.params.id,
    userId: req.user._id,
  };
  const newReview = await ReviewAndRating.create(reivewObject);
  //   console.log(newReview);
  res.status(200).json({
    status: 'success',
    newReview,
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  //   console.log(req.params.id);

  const allReviews = await ReviewAndRating.find({
    cuisineId: req.params.id,
  }).populate({
    path: 'userId cuisineId',
    select: 'name address -_id',
  });
  res.status(200).json({
    status: 'success',
    allReviews,
  });
});

exports.getAReview = catchAsync(async (req, res, next) => {
  const review = await ReviewAndRating.findById(req.params.reviewId).populate({
    path: 'cuisineId userId',
    select: 'address name',
  });
  if (!review) {
    return next(new AppError('No reviews with given ID was found', 404));
  }
  res.status(200).json({
    status: 'success',
    review,
  });
});

// TODO
// implement reply feature
