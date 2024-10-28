const mongoose = require('mongoose');
// const slugify = require('slugify');

const tableReservationSchema = new mongoose.Schema({
  total: {
    type: Number,
    required: true,
  },
  reservationDate: {
    type: Date,
    required: true,
  },
  reservationTimeStr: {
    type: String,
    required: true,
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
  type: {
    type: String,
    default: 'reservation',
    enums: {
      values: ['reservation'],
      message: 'type can only be reservation',
    },
  },
  remarks: {
    type: String,
    required: true,
    default: 'reservation order has been placed',
  },
  additionalRequest: {
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

// TTL index to remove reservation after few days after the reservation date
tableReservationSchema.index(
  { reservationDate: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 7 },
);
const Reservation = mongoose.model('Reservation', tableReservationSchema);
Reservation.createIndexes();
module.exports = Reservation;
