const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);

router.patch('/verification/:token', authController.verification);
router.post('/resend-verification', authController.resendVerification);

router.post('/signin', authController.signin);
router.get('/signout', authController.signout);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

module.exports = router;
