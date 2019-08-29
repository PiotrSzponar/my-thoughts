const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

// Google Auth
router.get(
  '/signup/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email']
  })
);
// Success Google login
router.get(
  '/signup/google/redirect',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '../google'
  }),
  authController.socialSignin
);

// Facebook Auth
router.get(
  '/signup/facebook',
  passport.authenticate('facebook', {
    session: false,
    scope: 'email'
  })
);
// Success Facebook login
router.get(
  '/signup/facebook/redirect',
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: '../facebook'
  }),
  authController.socialSignin
);

// Profile complement after first google/facebook login (isCompleted: false -> true)
router.patch(
  '/signup/social-complete',
  authController.protect,
  authController.socialCompleteValidator,
  userController.socialComplete
);

// User Sign Up (local)
router.post('/signup', authController.signupValidator, authController.signup);

// Verify user email address
router.patch('/verification/:token', authController.verification);
// resend verification message with refreshed token
router.post('/resend-verification', authController.resendVerification);

// User Sign In (local)
router.post('/signin', authController.signin);

// User Sign Out
router.get('/signout', authController.signout);

// Forgot password: provide user email and get the message...
router.post('/forgot-password', authController.forgotPassword);
// ...with token that confirm user. Then change password.
router.patch(
  '/reset-password/:token',
  authController.updatePasswordValidator,
  authController.resetPassword
);

// After this MW - only for logged in users
router.use(authController.protect);

// Find users
router.get('/search', userController.search);

// Operations on logged in user
router
  .route('/me/')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
// Separate path to change password
router.patch(
  '/me/change-password',
  authController.updatePasswordValidator,
  authController.updatePassword
);

// After this MW - only for Admin
router.use(authController.restrictTo('admin'));

// Operations on users
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

// Operations on provided user
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
