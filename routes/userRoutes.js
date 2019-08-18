const express = require('express');
const authController = require('../controllers/authController');
const authGoogleController = require('../controllers/authGoogleController');
const passport = require('passport');

const router = express.Router();


//Google Signup
//start google starategy
router.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));
router.get('/googleLogout', (req, res) => {
    res.redirect('https://accounts.google.com/logout');
    //token reset 
})
//succcess
router.get('/profile', passport.authenticate('google', { session: false, failureRedirect: '/google' }), function (req, res) {
    authGoogleController.signToken(req, res);
})
//callback google

router.get('/verify', authGoogleController.checkTokenMW, (req, res) => {
    authGoogleController.verifyToken(req, res);
    if (null === req.authData) {
        res.sendStatus(403);
    } else {
        res.json(req.authData);
    }
});
//End of Google verification

//Facebook Signup
router.get('/facebook', passport.authenticate('facebook'));

router.get('/profileFb', passport.authenticate('facebook', { session: false, failureRedirect: '/facebook' }), function (req, res) {
    authGoogleController.signToken(req, res);
})

router.post('/signup', authController.signup);

router.patch('/verification/:token', authController.verification);
router.post('/resend-verification', authController.resendVerification);

router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

module.exports = router;
