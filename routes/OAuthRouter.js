const express = require('express');
const OAuthController = require('../controller/OAuthController');
const cuisineController = require('../controller/cuisineController');
const router = express.Router();

router.get('/google', OAuthController.authGoogle);
router.get('/google/callback', OAuthController.authGoogleCallback);

module.exports = router;
