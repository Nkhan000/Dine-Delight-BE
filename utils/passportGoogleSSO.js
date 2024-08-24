// const passport = require('passport');
// const User = require('../models/userModel');
// const AppError = require('./appError');
// const catchAsync = require('./catchAsync');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: 'http://127.0.0.1:3000/api/v1/user/auth/google/callback',
//       passReqToCallback: true,
//     },
//     async (req, accessToken, refreshToken, profile, cb) => {
//       // console.log(profile);
//       const defaultUser = {
//         name: `${profile.displayName}`,
//         email: `${profile.emails[0].value}`,
//         image: `${profile.photos[0].value}`,
//         googleId: profile.id,
//       };

//       const user = await new User(defaultUser);
//       await user.save({ validateBeforeSave: false });
//       console.log(user);
//       if (user && user[0]) return cb(null, user && user[0]);
//     },
//   ),
// );

// passport.serializeUser((user, cb) => {
//   console.log('Serializing User', user);
//   cb(null, user.id);
// });

// passport.deserializeUser(async (id, cb) => {
//   const user = await User.findById(id).catch((err) => {
//     console.log('Deserialized err : ', err);
//     cb(err, null);
//   });

//   console.log('Deserailized User', user);

//   if (user) cb(null, user);
// });

// const { OAuth2Client } = require('google-auth-library');
// const catchAsync = require('../utils/catchAsync');

// async function getUserInfo(access_token) {
//   const response = await fetch(
//     `https://www.googleapis.com/oauth2/v3/userinfo?access_token${access_token}`,
//   );
//   const data = await response.json();
//   console.log('DATA : ', data);
// }

// exports.getloggedInInfo = catchAsync(async (req, res, next) => {
//   const code = req.query.code;
//   const redirectUrl = 'http://127.0.0.1:3000/api/v1/user/auth/google/callback';
//   const oAuth2Client = new OAuth2Client(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET,
//     redirectUrl,
//   );
//   const res = await oAuth2Client.getToken(code);
//   await oAuth2Client.setCredentials(res.tokens);
//   const user = oAuth2Client.credentials;
//   await getUserInfo(user.access_token);

//   //
// });

// Initialize passport
// app.use(passport.initialize());
// app.use(passport.session());

// // Define User model
// const User = mongoose.model('User', {
//   googleId: String,
//   username: String
// });

// Configure Google OAuth 2.0 Strategy
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.use(
  new GoogleStrategy(
    {
      clientID: 'your_client_id',
      clientSecret: 'your_client_secret',
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      // Check if user exists in database
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        // Create new user
        user = await User.create({
          googleId: profile.id,
          username: profile.displayName,
        });
      }
      return done(null, user);
    },
  ),
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
