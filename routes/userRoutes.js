const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.get('/verification', authController.verification);
router.post('/resendverification', authController.resendVerification);
router.post('/login', authController.login);

module.exports = router;
