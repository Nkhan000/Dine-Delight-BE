const { default: mongoose } = require('mongoose');

const BookedVenueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  bookedOnDate: {
    type: Date,
    required: true,
    default: true,
  },
  bookingDate: {
    type: Date,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  hasPaid: {
    type: Boolean,
    required: true,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  partySize: {
    type: String,
    required: true,
  },
  foodServiceIncluded: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const BookedVenue = mongoose.model('BookingsVenue', BookedVenueSchema);
module.exports = BookedVenue;
