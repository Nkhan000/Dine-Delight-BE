const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provide a name'],
    trim: true,
    minlength: [8, 'name must contain minimum of 8 charecters'],
    maxlength: [20, 'name must contain maximum of 20 charecters'],
  },
  password: {
    type: String,
    // required: [true, 'Please provide a password'],
    required: [true, 'Password is a required Field'],
    minlength: [8, 'minimum 8 charecters are required for password'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please comfirm your password'],
    validate: {
      // only works on SAVE and CREATE
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password and confirm password are not same. Please try again',
    },
  },
  address: {
    type: String,
    // required: [true, 'cuisine must have an address'],
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
  contactNumber: {
    type: String,
  },
  hasCuisine: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Boolean,
    validate: {
      validator: function (val) {
        this.role === 'user' ? true : false;
      },
    },
    // default: false,
  },
  onGoingDeliveriesId: {
    type: [mongoose.Schema.ObjectId],
    ref: 'Delivery',
  },
  email: {
    type: String,
    unique: [true, 'email should be unique'],
    required: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  image: {
    type: String,
  },
  googleId: {
    type: String,
    default: null,
    select: false,
  },
  facebookId: {
    type: String,
    // unique: true,
    default: null,
    select: false,
  },
  tokenExpiresIn: {
    type: Date,
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetTokenExpires: {
    type: Date,
    select: false,
  },
  googleAccessToken: {
    type: String,
    select: false,
  },
  googleRefreshToken: {
    type: String,
    select: false,
  },
  cuisineId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cuisine',
  },
});

// REFRESH THE USER TOKEN CAME FROM THE OAUTH AUTHENTICATION

// TO ENCRYPT THE PASSWORD IN THE DATABSE
userSchema.pre('save', async function (next) {
  if (this.googleAccessToken) {
    this.googleAccessToken = await bcrypt.hash(this.googleAccessToken, 12);
    this.googleRefreshToken = await bcrypt.hash(this.googleRefreshToken, 12);
    return next();
  }
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// INstance method

// TO COMPARE THE ENCRYPTED PASSWORD WITH THE PROVIDED PASSWORD
userSchema.methods.correctPassword = async function (
  candidatePassword,
  password,
) {
  return await bcrypt.compare(candidatePassword, password);
};

// TO CHECK WHETHER THE PASSWORD WAS AFTER THE TOKEN WAS ISSUED
userSchema.methods.passwordChangedAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    // console.log(changedAt, JWTTimeStamp);
    return JWTTimeStamp < changedAt;
  }
  return false;
};

// TO CREATE A RESET TOKEN TO RESET PASSWORD
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
