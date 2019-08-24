const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2');
const FacebookStrategy = require('passport-facebook');
const User = require('../models/userModel');

//save cookie
// passport.serializeUser((user, done) => {
//     done(null, user.id);
// })

// //when cookie comeback to us
// passport.deserializeUser((id, done) => {
//     UserG.findById(id).then((user) => {
//         done(null, user);
//     });
// })

//Google
passport.use(
  new GoogleStrategy(
    {
      //options for the google start
      callbackURL: '/api/users/googleCallback',
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    (accessToken, refreshToken, profile, done) => {
      //passport callback function
      //check if user exists in db
      User.findOne({ 'google.gId': profile.id }).then(currentUser => {
        if (currentUser) {
          //already have the user
          console.log('Current user ', currentUser);
          //send to serialize
          return done(null, currentUser);
        } else {
          console.log(profile);
          new User({
            methods: 'google',
            isVerified: true,
            name: profile.given_name,
            email: profile.email,
            google: { gId: profile.id }
          })
            .save()
            .then(newUser => {
              console.log('new user created', newUser);
              //send to serialize
              return done(null, newUser);
            });
        }
      });
    }
  )
);
//Facebook
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: '/api/users/facebookCallback',
      profileFields: ['id', 'emails', 'name']
    },
    function(accessToken, refreshToken, profileRaw, done) {
      const profile = profileRaw._json;
      User.findOne({ 'facebook.fId': profile.id }).then(currentUser => {
        if (currentUser) {
          //already have the user
          console.log('Current user ', currentUser);
          //send to serialize
          return done(null, currentUser);
        } else {
          console.log(profileRaw);
          new User({
            methods: 'facebook',
            isVerified: true,
            name: profile.first_name,
            email: profile.email,
            facebook: { fId: profile.id }
          })
            .save()
            .then(newUser => {
              console.log('new user created', newUser);
              //send to serialize
              return done(null, newUser);
            });
        }
      });
    }
  )
);
