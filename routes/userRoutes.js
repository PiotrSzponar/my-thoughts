const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);

router.patch('/verification/:token', authController.verification);
router.post('/resend-verification', authController.resendVerification);

router
  .route('/')
  .get(authController.restrictTo('admin'), authController.getAllUsers)
  .post(authController.createUser);

router
  .route('/:id')
  .get(authController.protect, authController.getUser)
  .patch(authController.updateUser)
  .delete(authController.deleteUser);

router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

module.exports = router;
