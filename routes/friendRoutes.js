const express = require('express');
const friendController = require('../controllers/friendController');
const { protect } = require('../controllers/authController');

const router = express.Router();

// After this MW - only for logged in users
router.use(protect);

router.get('/request-friend', friendController.requestFriend);
router.get('/accept-friend', friendController.acceptFriend);

// remove works same as reject
router.get('/reject-friend', friendController.rejectFriend);
router.get('/remove-friend', friendController.rejectFriend);

module.exports = router;
