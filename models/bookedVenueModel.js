const { default: mongoose } = require('mongoose');

const BookedVenueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  bookedOnDate: {
    type: Date,
    // required: true,
    default: Date.now(),
  },
  venueBookingStartDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    default: 'unconfirmed',
    enums: {
      values: ['unconfirmed', 'confirmed', 'canceled'],
      message: 'Status can be unconfirmed, confirmed or canceled',
    },
  },
  venueBookingEndDate: {
    type: Date,
    required: true,
  },
  numOfDays: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: String,
    required: true,
  },
  hasPaid: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  cuisineId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cuisine',
    required: true,
  },
  aprPartySize: {
    type: String,
    required: true,
  },
  foodServiceIncluded: {
    type: Boolean,
    required: true,
    default: false,
  },
  otpCode: {
    type: Number,
  },
});

BookedVenueSchema.pre('save', function (next) {
  if (this.isNew) {
    const otp = Math.floor(Math.random() * 10000);
    this.otpCode = otp;
  }
  next();
});

BookedVenueSchema.index(
  { venueBookingStartDate: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 7 },
);

const BookedVenue = mongoose.model('BookedVenue', BookedVenueSchema);
module.exports = BookedVenue;
