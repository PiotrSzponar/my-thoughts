const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

// Google Signup
// start google strategy
router.get(
  '/signup/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email']
  })
);
// success
router.get(
  '/signup/google/redirect',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '../google'
  }),
  authController.socialSignin
);

router.patch(
  '/signup/social-complete',
  authController.protect,
  authController.socialComplete
);

router.post('/signup', authController.signup);

router.patch('/verification/:token', authController.verification);
router.post('/resend-verification', authController.resendVerification);

router.post('/signin', authController.signin);
router.get('/signout', authController.signout);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// After this MW - only for logged in users
router.use(authController.protect);

router.get('/search', userController.search);

router
  .route('/me/')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.patch('/me/change-password', authController.updatePassword);

// After this MW - only for Admin
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
