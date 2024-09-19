const mongoose = require('mongoose');
const slugify = require('slugify');
// const foodItemSchema = require('../models/foodItemModal');
// const Reservation = require('./reservationModel');
// const validator = require('validator');

// const foodItemSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   price: {
//     type: Number,
//     required: true,
//   },
//   quantityPerServing: {
//     type: String,
//     required: true,
//   },
//   size: {
//     type: String,
//   },
//   type: {
//     type: String,
//     required: true,
//   },
//   category: {
//     type: String,
//     required: true,
//   },
//   mainIngredients: {
//     type: [String],
//     required: true,
//   },
//   image: {
//     type: String,
//     default: './img/foodItem-momo-1.jpg',
//   },
// });

const cuisineSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: [true, 'name has to be unique'],
    required: [true, 'name is a required field'],
    trim: true,
    minlength: [8, 'name must contain atleast 8 characters '],
    maxlength: [36, ' name must not be longer than 36 characters'],
    // validate: [validator.isAlpha, 'name must only contain alphabets'],
  },
  services: {
    type: [],
    // required: [true, 'minimum one service should be defined'],
    enums: {
      values: ['delivery', 'reservation', 'venue'],
      message:
        'Services must include atleast one and must be delivery, reservation or venue ',
    },
  },
  tableReservationPrice: {
    type: Number,
    validate: {
      validator: function (val) {
        this.services.includes('reservation') ? val : 0;
      },
    },
  },
  deliveryPrice: {
    type: Number,
    validate: {
      validator: function (val) {
        this.services.includes('delivery') ? val : 0;
      },
    },
    default: 5,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  slug: String,
  address: {
    type: String,
    required: [true, 'cuisine must have an address'],
  },
  locationCoords: {
    //GeoJSON
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: [Number],
    address: String,
    description: String,
  },
  ratingsAverage: {
    type: Number,
    default: 2.5,
    min: [1.0, 'ratings must be above 0'],
    max: [5.0, 'ratings must be lower than 5'],
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  numberOfDeliveries: {
    type: Number,
    default: 0,
  },
  numberOfBookings: {
    type: Number,
    default: 0,
  },
  numberOfReservations: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  logoImage: {
    type: String,
    required: true,
  },
  highlightImages: {
    type: [String],
  },
  availableTableReservationTime: {
    type: [String],
    required: true,
  },
  tableTypeOptions: {
    type: [String],
    required: true,
  },
  reservationPartySizeOptions: {
    type: [Number],
    required: true,
  },
  onGoingDeliveriesId: {
    type: [mongoose.Schema.ObjectId],
    ref: 'Delivery',
  },
  onGoingBookingsId: {
    type: [mongoose.Schema.ObjectId],
    ref: 'BookingsMenu',
  },

  onGoingReservationsId: {
    type: [mongoose.Schema.ObjectId],
    ref: 'Reservations',
  },
  foodMenu: {
    type: mongoose.Schema.ObjectId,
    ref: 'FoodMenu',
  },
  venueMenu: {
    type: mongoose.Schema.ObjectId,
    ref: 'VenuesMenu',
  },
  totalReservations: {
    type: mongoose.Schema.ObjectId,
    ref: 'Reservation',
  },
});

//MONGOOSE MIDLEWARES
// Document middleware -> runs before .save() or .create();
cuisineSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Query middleware
cuisineSchema.pre(/^find/, function (next) {
  this.start = Date.now();
  next();
});

cuisineSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// AGGERAGATION MIDDLEWARE
//MODEL
const Cuisine = mongoose.model('Cuisine', cuisineSchema);
module.exports = Cuisine;
// module.exports = foodItemSchema;
