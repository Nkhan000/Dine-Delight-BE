const express = require('express');
const reservationController = require('../controller/reservationController');
const authController = require('../controller/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, reservationController.getAllReservations);

router
  .route('/verify-user')
  .get(authController.protect, reservationController.sendVerificationCode)
  .post(authController.protect, reservationController.verifyVerificationCode);

router
  .route('/create-new-reservation')
  .post(authController.protect, reservationController.createAReservation);
router
  .route('/all-reservations')
  .get(authController.protect, reservationController.getAllReservationByUserId);

router
  .route('/add-party-size')
  .post(authController.protect, reservationController.addPartySize);
router
  .route('/add-time-slot')
  .post(authController.protect, reservationController.addTimeSlot);
router
  .route('/add-table-type')
  .post(authController.protect, reservationController.addTableType);

module.exports = router;
