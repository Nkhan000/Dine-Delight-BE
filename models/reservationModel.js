const mongoose = require('mongoose');
// const slugify = require('slugify');

const tableReservationSchema = new mongoose.Schema({
  price: {
    type: Number,
    ref: 'Cuisine',
  },
  hours: {
    type: Number,
    required: true,
    select: false,
  },
  minutes: {
    type: Number,
    required: true,
    select: false,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now(),
    select: false,
  },
  reserveDate: {
    type: Date,
  },
  priority: {
    type: Boolean,
    default: false,
  },
  partySize: {
    type: Number,
    required: true,
    min: [2, 'party size must be atleast 2 people'],
    max: [12, 'party size must not exceed more than 12 people'],
  },
  securityCode: {
    type: Number,
  },
  hasCheckedIn: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: {
      values: ['not arrived', 'arrived', 'canceled'],
      message:
        'Only not arrived, arrived and canceled in allowed in status field',
    },
    default: 'not arrived',
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

// MIDDLEWARES
// to set a reserve date with given hours and minutes
tableReservationSchema.pre('save', function (next) {
  const reserveDate = new Date(this.date);
  reserveDate.setUTCHours(this.hours);
  reserveDate.setUTCMinutes(this.minutes);
  this.reserveDate = reserveDate;
  next();
});

// to set a security code for further confirmation
// tableReservationSchema.pre('save', function (next) {
//   if (this.hasCheckedIn == true || this.hasCheckedIn == null) return next();
//   this.securityCode = Math.floor(Math.random() * 10000)
//     .toString()
//     .padStart(4, '0');

//   next();
// });

//MODEL
const Reservation = mongoose.model('Reservation', tableReservationSchema);
module.exports = Reservation;
