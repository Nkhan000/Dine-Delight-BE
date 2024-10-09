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

// ---------------- VENUE ROUTES FOR A CUISINE (BUSINESS) --------------------- //
router
  .route('/get-all-venues')
  .get(authController.protect, venueController.getAllVenueDetailBS);
module.exports = router;
