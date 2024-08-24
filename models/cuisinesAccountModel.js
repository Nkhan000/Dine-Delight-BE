// const { Mongoose } = require('mongoose');
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  // Delivery
  // Reservation
  // Venue
  // Discount
  // Discount
  cuisineId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cuisine',
  },
});

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;
