const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth2');

//new strategy
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');

// const FacebookStrategy = require('passport-facebook');
const User = require('../models/userModel');
const catchAsync = require('./catchAsync');

passport.use(
  new GoogleTokenStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(
        catchAsync(async () => {
          let user = await User.findOne({ 'googleProvider.id': profile.id });

          //user found
          if (user) {
            return done(null, user);
          }

          const usr = await User.findOne({
            email: profile.emails[0].value
          });

          if (usr && usr.method !== 'google') {
            return done(null, false, {
              message: 'User registered using other method'
            });
          }

          if (!user) {
            user = await User.create({
              email: profile.emails[0].value,
              method: 'google',
              name: profile.displayName,
              photo: profile.picture,
              isCompleted: false,
              isVerified: true,
              googleProvider: {
                id: profile.id,
                token: accessToken
              }
            });
            return done(null, user);
          }
        })
      );
    }
  )
);

passport.use(
  new FacebookTokenStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(
        catchAsync(async () => {
          //check if user exists in db
          let user = await User.findOne({ 'facebookProvider.id': profile.id });

          //already have the user
          if (user) {
            //send to serialize
            return done(null, user);
          }

          const usr = await User.findOne({
            email: profile.emails[0].value
          });

          if (usr && usr.method !== 'facebook') {
            return done(null, false, {
              message: 'User registered using other method'
            });
          }

          // new user
          user = await User.create({
            method: 'facebook',
            email: profile.emails[0].value,
            name: profile.displayName,
            photo: profile.photos ? profile.photos[0].value : 'default.jpg',
            facebookProvider: {
              id: profile.id,
              token: accessToken
            },
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
