const express = require('express');
const authController = require('../controller/authController');
const venueController = require('../controller/venueController');

const router = express.Router;

router
  .route('/')
  .post(authController.protect, venueController.createAVenueBooking);

module.exports = router;
