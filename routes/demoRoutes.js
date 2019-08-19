const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/login', userController.getLoginUser);

router.get(
  '/admin',
  authController.restrictTo('admin'),
  userController.getAdmin
);

module.exports = router;
