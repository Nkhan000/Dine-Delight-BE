const express = require('express');
const reservationController = require('../controller/reservationController');
const authController = require('../controller/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, reservationController.getAllReservations);

module.exports = router;
