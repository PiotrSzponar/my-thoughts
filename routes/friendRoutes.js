const express = require('express');
const friendController = require('../controllers/friendController');
const { protect } = require('../controllers/authController');

const router = express.Router();

// After this MW - only for logged in users
router.use(protect);

router.get('/request-friend', friendController.requestToFriends);
router.get('/accept-friend', friendController.acceptToFriends);

// remove works same as reject
router.get('/reject-friend', friendController.deletefromFriends);
router.get('/delete-friend', friendController.deletefromFriends);

module.exports = router;
