const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const axios = require('axios');
const createJWTToken = require('../utils/createJWTToken');

// Google OAuth 2.0 authentication routes
const redirectURL = 'http://127.0.0.1:3000/api/v1/auth/google/callback';
// const redirectURL = 'http://localhost:5173';

exports.authGoogle = catchAsync(async (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Referrer-Policy', 'no-referrer-when-downgrade');

  // Generate the url that will be used for the consent dialog.
  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectURL,
  );
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope:
      'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid ',
    prompt: 'consent',
  });

  // console.log(authorizeUrl);

  res.redirect(authorizeUrl);
});

exports.authGoogleCallback = catchAsync(async (req, res, next) => {
  const code = req.query.code;
  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectURL,
  );
  const { tokens } = await oAuth2Client.getToken(code);

  // Make sure to set the credentials on the OAuth2 client.
  oAuth2Client.setCredentials(tokens);
  const user = oAuth2Client.credentials;
  console.log('Credentials : ', user);

  let token;
  const decode = jwt.decode(user.id_token);
  console.log('DECODE : ', decode);
  const userExist = await User.findOne({ email: decode.email });
  let newUser;
  if (userExist) {
    token = createJWTToken.signToken(userExist._id);
  } else {
    newUser = new User({
      name: decode.name,
      email: decode.email,
      image: decode.picture,
      googleId: decode.sub,
      googleAccessToken: user.access_token,
      googleRefreshToken: user.refresh_token,
      tokenExpiresIn: new Date(user.expiry_date),
    });
    await newUser.save({ validateBeforeSave: false });
    token = createJWTToken.signToken(newUser._id);
    // console.log(newUser);
  }

  req.user = newUser;
  const URI = `http://localhost:5173/login?userId=${token}`;
  res.redirect(303, URI);
});
// THIS FUNCTION IS MISSING THE FEATURE OF LOGGING IN A USER AND CHECKING BEFORE LOGGING OR SIGNING UP WHETHER THE USER ALREADY EXISTS OR NOT

// TO IMPLEMENT THIS FEATURE
exports.refershUser = async (req, res, next) => {};

// const cookieOptions = {
//   expiresIn: new Date(
//     Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
//   ),
//   httpOnly: true,
// };
// if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
// res.cookie('jwt', token, cookieOptions);
