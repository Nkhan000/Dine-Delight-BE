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
  startDate: {
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
  endDate: {
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
  },
  cuisineId: {
    type: mongoose.Schema.ObjectId,
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

const BookedVenue = mongoose.model('BookingsVenue', BookedVenueSchema);
module.exports = BookedVenue;
