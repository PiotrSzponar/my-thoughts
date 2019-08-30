const express = require('express');
const friendController = require('../controllers/friendController');
const { protect } = require('../controllers/authController');

const router = express.Router();

// After this MW - only for logged in users
router.use(protect);

router.post('/request', friendController.requestToFriends);
router.post('/accept', friendController.acceptToFriends);

// remove works same as reject
router.post('/reject', friendController.deletefromFriends);

//get user friends
module.exports = router;
