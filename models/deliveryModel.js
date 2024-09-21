const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  itemId: {
    type: mongoose.Schema.ObjectId,
    ref: 'FoodMenu',
  },
});

const deliverySchema = new mongoose.Schema({
  orderItems: {
    type: [orderItemSchema],
    required: true,
  },
  deliveryDate: {
    type: Date,
    default: Date.now(),
  },
  cuisineName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'delivery',
    enums: {
      values: ['delivery'],
      message: 'type can only be delivery',
    },
  },
  remarks: {
    type: String,
    default: 'Delivery order has been placed',
  },
  cuisineAddress: {
    type: String,
  },
  cuisineId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Cuisine',
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    default: 'confirmed',
    enums: {
      values: ['delivered', 'unconfirmed', 'confirmed', 'on the way'],
      message:
        'Status can not be diffrent than delivered, not delivered and on the way',
    },
  },
  // location coords to be included
  deliveryAddress: {
    type: String,
  },
  deliveryContact: {
    type: String,
  },
  total: {
    type: Number,
    required: true,
  },
  paymentType: {
    type: String,
    enums: {
      values: ['online', 'cod'],
      message: 'Payment type cannot be other than online or cash payment',
    },
  },
});
deliverySchema.index(
  { deliveryDate: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 7 },
);

const Delivery = mongoose.model('Delivery', deliverySchema);

module.exports = Delivery;
