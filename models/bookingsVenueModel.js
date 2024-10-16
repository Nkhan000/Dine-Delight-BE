const mongoose = require('mongoose');

const venueItemSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  availableTime: {
    type: Date,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  pricePerDay: {
    type: String,
    required: true,
  },
  aprPartySize: {
    type: String,
    required: true,
  },
  goodForOccassions: {
    type: [String],
    required: true,
  },
  images: {
    type: [String],
    // default: ['food-001.jpg'],
  },
});

const venuesMenuSchema = new mongoose.Schema({
  venueItems: [venueItemSchema],
  cuisineId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cuisine',
  },
  partySizeList: {
    type: [String],
  },
});
const VenuesMenu = mongoose.model('VenuesMenu', venuesMenuSchema);
module.exports = VenuesMenu;
