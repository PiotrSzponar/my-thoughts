const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

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

router.route('/me/').get(userController.getUser);

// After this MW - only for Admin
router.use(authController.restrictTo('admin'));

router.route('/:id').get(userController.getUser);

module.exports = router;
