const express = require('express');
const cuisineController = require('../controller/cuisineController');
const authController = require('../controller/authController');
const reviewController = require('../controller/reviewController');
const foodMenuController = require('../controller/foodMenuController');
const deliveryController = require('../controller/deliveryController');
const venueController = require('../controller/venueController');
const highlightsController = require('../controller/highlightsController');

const router = express.Router();

// Param middleware -> here middleware func should be in the controller file as a middleware
// router.params("id", middlewareFunc)

router.route('/').get(cuisineController.getAllCuisines);
router
  .route('/create-new-cuisine')
  .post(authController.protect, cuisineController.createACuisine);

// IMPLEMENT A ROUTE TO GET A CUISINE DATA FOR BUSINESS DASHBOARD CONTAINING ALL THE USEFULL INFORMATION AND INSIGHTS OF THE CUISINE
router
  .route('/businessProfile')
  .get(authController.protect, cuisineController.getCuisineForBusiness);

// Get All cuisines with similar services
router.route('/service/:serviceName').get(cuisineController.getService);

// THIS ROUTE IS PUBLIC SO THAT IMPORTANT AND SENSITIVE DATA LIKE CERTIFICATE, NUMBER,OWNER,ETC MUST BE HIDDEN IN THIS ROUTE. NOT IMPLEMENTED YET
// GETCUISINE AND FOOD MENU/ RESERVATION / VENUES
router
  .route('/:id')
  .get(cuisineController.cuisineExist, cuisineController.getCuisineData);

// -----------------FOOD MENU ROUTES FOR A CUISINES (BUSINESS ROUTE) -------------------- //

router
  .route('/update-menu-items')
  .post(
    authController.protect,
    foodMenuController.uploadFoodMenuPhoto,
    foodMenuController.resizeFoodMenuPhoto,
    foodMenuController.addNewItemToMenu,
  )
  .put(
    authController.protect,
    foodMenuController.uploadFoodMenuPhoto,
    foodMenuController.resizeFoodMenuPhoto,
    foodMenuController.updateItemsFromMenu,
  )
  .patch(authController.protect, foodMenuController.removeItemsFromMenu);

// -----------------REVIEW ROUTES FOR A CUISINES-------------------- //

// CREATE a new review
router
  .route('/:id/new-review')
  .post(authController.protect, reviewController.createAReview);

// GET all reviews for a cuisine
router
  .route('/:id/get-all-reviews')
  .get(cuisineController.cuisineExist, reviewController.getAllReviews);

// GET a review for a cuisine
router.route('/get-review/:reviewId').get(reviewController.getAReview);

// ---------------- VENUE BOOKING ITEMS AND BOOKINGS ROUTES FOR A CUISINE --------------------- //

// ---------------- DELIVERY ROUTES FOR A CUISINE --------------------- //

router
  .route('/delivery/new')
  .post(authController.protect, deliveryController.createADelivery);
router
  .route('/delivery/get-one')
  .get(authController.protect, deliveryController.getADeliveryData);

// ---------------- DELIVERY ROUTEES FOR A CUISINE (BUSINESS) --------------------- //
router
  .route('/business/delivery/all/:cuisineId')
  .get(deliveryController.getAllDeliveryDataBS);

// ---------------- HIGHLIGHTS (BUSINESS) --------------------- //

module.exports = router;
