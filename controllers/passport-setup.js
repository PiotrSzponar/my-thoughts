const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2');
const dotenv = require('dotenv');
const UserG = require('../models/userModel').UserG;
dotenv.config({ path: './config/dev.env' });

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


passport.use(
    new GoogleStrategy({
        //options for the google start
        callbackURL: '/api/users/profile',
        clientID: '1098600127784-5uhprv5fqtrhvn4mmebmo84gvlr43kuk.apps.googleusercontent.com',//process.env.GOOGLE_CLIENT_ID,
        clientSecret: 'iCCKNinMCARf47VKkzNDYlCn'//process.env.GOOGLE_CLIENT_SECRET
    }, (accessToken, refreshToken, profile, done) => {
        //passport callback function
        //check if user exists in db 
        UserG.findOne({ googleId: profile.id })
            .then((currentUser) => {
                if (currentUser) {
                    //already have the user 
                    console.log("Current user ", currentUser);
                    //send to serialize
                    return done(null, currentUser);
                } else {
                    new UserG({ username: profile.displayName, googleId: profile.id }).save().then((newUser) => {
                        console.log('new user created', newUser);
                        //send to serialize
                        return done(null, newUser);
                    });
                }
            })
    })
)