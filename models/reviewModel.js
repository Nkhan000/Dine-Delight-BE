const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: [1.0, 'A rating must be atleast 1'],
    max: [5.0, 'A rating must not be higher than 5'],
  },
  review: {
    type: String,
    minLength: [10, 'A review must be of more than 10 words'],
    maxLength: [100, 'A review must be of less than 100 words'],
  },
  reply: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  image: {
    type: String,
  },
  cuisineId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cuisine',
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
});

const ReviewAndRating = mongoose.model('ReviewAndRating', reviewSchema);
module.exports = ReviewAndRating;
