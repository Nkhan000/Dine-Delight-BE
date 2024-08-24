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
