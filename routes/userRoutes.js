const express = require('express');
const authController = require('../controllers/authController');
const passport = require('passport');

const router = express.Router();


//Google Signup
//start google starategy
router.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));
router.get('/googleLogout', (req, res) => {
    res.redirect('https://accounts.google.com/logout');
    //token reset 
})
//succcess callback from  google gain token from our app and redirect to login
router.get('/googleCallback', passport.authenticate('google', { session: false, failureRedirect: '/google' }), authController.googleSignIn)
//End of Google verification

//Facebook Signup
router.get('/facebook', passport.authenticate('facebook',{session:false,scope:['email']}));

router.get('/facebookCallback', passport.authenticate('facebook', { session: false, failureRedirect: '/facebook' }), authController.facebookSignIn)

router.post('/signup', authController.signup);

router.patch('/verification/:token', authController.verification);
router.post('/resend-verification', authController.resendVerification);

router.post('/signin', authController.signin);
router.get('/signout', authController.signout);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

module.exports = router;
