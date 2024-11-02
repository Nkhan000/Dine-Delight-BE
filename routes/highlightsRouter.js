const express = require('express');
const authController = require('../controller/authController');
const highlightsController = require('../controller/highlightsController');

const router = express.Router();

router
  .route('/')
  .post(
    authController.protect,
    highlightsController.uploadHighlightImages,
    highlightsController.resizeHighlightImages,
    highlightsController.uploadHighlights,
  )
  .patch(authController.protect, highlightsController.removeHighlights);

module.exports = router;
