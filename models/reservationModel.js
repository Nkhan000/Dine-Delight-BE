const mongoose = require('mongoose');
// const slugify = require('slugify');

const tableReservationSchema = new mongoose.Schema({
  // price: {
  //   type: Number,
  //   ref: 'Cuisine',
  // },

  reservationDate: {
    type: Date,
    required: true,
    default: Date.now(),
    select: false,
  },
  reservedOnDate: {
    type: Date,
    default: Date.now(),
  },
  priority: {
    type: Boolean,
    default: false,
  },
  aprPartySize: {
    type: Number,
    required: true,
    min: [2, 'party size must be atleast 2 people'],
    max: [12, 'party size must not exceed more than 12 people'],
  },
  otpCode: {
    type: Number,
  },
  hasCheckedIn: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: {
      values: ['unconfirmed', 'confirmed', 'canceled'],
      message:
        'Only not arrived, arrived and canceled in allowed in status field',
    },
    default: 'unconfirmed',
  },
  tableType: {
    type: String,
    required: true,
  },
  remarks: {
    type: String,
    required: true,
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
// tableReservationSchema.pre('save', function (next) {
//   const reserveDate = new Date(this.date);
//   reserveDate.setUTCHours(this.hours);
//   reserveDate.setUTCMinutes(this.minutes);
//   this.reserveDate = reserveDate;
//   next();
// });

// to set a security code for further confirmation
// tableReservationSchema.pre('save', function (next) {
//   if (this.hasCheckedIn == true || this.hasCheckedIn == null) return next();
//   this.securityCode = Math.floor(Math.random() * 10000)
//     .toString()
//     .padStart(4, '0');

//   next();
// });

//MODEL
tableReservationSchema.index(
  { reservationDate: 1 },
  { expireAfterSeconds: 300 },
);
const Reservation = mongoose.model('Reservation', tableReservationSchema);
Reservation.createIndexes();
module.exports = Reservation;
