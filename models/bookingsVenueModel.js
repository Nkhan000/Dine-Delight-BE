const mongoose = require('mongoose');

const bookingItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  availableTime: {
    type: Date,
  },
  pricePerDay: {
    type: String,
    required: true,
  },
  aprPartySize: {
    type: String,
    required: true,
  },
  goodForOcassions: {
    type: [String],
    required: true,
  },
  images: {
    type: [String],
    default: ['food-001.jpg'],
  },
});

const bookingsMenuSchema = new mongoose.Schema({
  bookingItems: [bookingItemSchema],
  cuisineId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cuisine',
  },
});
const VenuesMenu = mongoose.model('VenuesMenu', bookingsMenuSchema);
module.exports = VenuesMenu;
