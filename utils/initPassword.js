const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

passport.use(
  new GoogleStrategy(
    {
      //options for the google start
      callbackURL: '/api/users/signup/google/redirect',
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    (req, accessToken, refreshToken, profile, done) => {
      process.nextTick(
        catchAsync(async () => {
          //check if user exists in db
          let user = await User.findOne({ googleId: profile.id });
          //already have the user
          if (user) {
            //send to serialize
            return done(null, user);
          }
          // new user
          user = await User.create({
            method: 'google',
            email: profile.email,
            name: profile.displayName,
            photo: profile.picture,
            googleId: profile.id,
            isCompleted: false,
            isVerified: true
          });
          //send to serialize
          return done(null, user);
        })
      );
    }
  )
);
