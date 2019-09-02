const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2');
const FacebookStrategy = require('passport-facebook');
const User = require('../models/userModel');
const catchAsync = require('./catchAsync');

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

passport.use(
  new FacebookStrategy(
    {
      //options for the facebook start
      callbackURL: '/api/users/signup/facebook/redirect',
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      profileFields: ['id', 'displayName', 'picture', 'email']
    },
    (req, accessToken, refreshToken, profile, done) => {
      process.nextTick(
        catchAsync(async () => {
          //check if user exists in db
          let user = await User.findOne({ facebookId: profile.id });
          //already have the user
          if (user) {
            //send to serialize
            return done(null, user);
          }
          // new user
          user = await User.create({
            method: 'facebook',
            email: profile.emails[0].value,
            name: profile.displayName,
            photo: profile.photos ? profile.photos[0].value : 'default.jpg',
            facebookId: profile.id,
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
