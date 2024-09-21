const express = require('express');
const authController = require('../controller/authController');
const venueController = require('../controller/venueController');

const router = express.Router();

router
  .route('/')
  .post(authController.protect, venueController.createAVenueBooking);

router
  .route('/')
  .get(authController.protect, venueController.getAVenueBookingDetail);

module.exports = router;
