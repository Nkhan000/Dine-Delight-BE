const Cuisine = require('./../models/cuisineModel');
const catchAsync = require('./../utils/catchAsync');
const FoodMenu = require('../models/foodItemModal');
const Delivery = require('../models/deliveryModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

exports.createADelivery = catchAsync(async (req, res, next) => {
  const allCuisines = await Cuisine.find();
  const orderObject = req.body;
  const user = req.user;

  if (
    !user.hasUserPremium &&
    user.remainingBatchOrder === 0 &&
    cart.length > 1
  ) {
    return next(new AppError('You don not have any batch orders left', 403));
  }

  // filtering out cuisines with invalid id
  orderObject.orders.cart = allCuisines
    .map((cuisine) =>
      orderObject.orders.cart.filter((order) =>
        cuisine._id.equals(order.cuisineId),
      ),
    )
    .flatMap((item) => item);

  newOrderObj = orderObject.orders.cart.map((item) => {
    return {
      ...item,
      userId: user.id,
      total: item.total,
    };
  });
  await Promise.all(
    newOrderObj.map(async (order) => {
      const newDelivery = await Delivery.create(order);

      const updatedField = {
        $push: { onGoingDeliveriesId: newDelivery._id },
      };

      if (newOrderObj.length > 1) {
        updatedField.remainingBatchOrders = 0;
      }

      await User.findByIdAndUpdate(
        { _id: user.id },
        updatedField,
        // {
        //   $push: { onGoingDeliveriesId: newDelivery._id },
        // },
      );
    }),
  );

  res.status(200).json({
    status: 'success',
    // newOrderObj,
  });
});

exports.getADeliveryData = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const delivery = await Delivery.find({ userId: userId });

  res.status(200).json({
    status: 'success',
    data: {
      delivery,
    },
  });
});

// Business Endpoint - BS
exports.getAllDeliveryDataBS = catchAsync(async (req, res, next) => {
  // for testing purpose only we are taking cuisineId from the url later it will be changed to loggedin user id
  const cuisineId = req.params.cuisineId;
  console.log(cuisineId);

  const allOnGoingDeliveries = await Delivery.findOne({
    cuisineId,
  });

  res.status(200).json({
    status: 'success',
    allOnGoingDeliveries,
  });
});

exports.approveOrRejectADeliveryBS = catchAsync(async (req, res, next) => {
  const orderId = req.params.orderId;
  const order = await Delivery.findById(orderId);
  if (!order) {
    return next(new AppError('No order with given ID was found', 404));
  }
});
