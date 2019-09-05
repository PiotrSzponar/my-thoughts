const express = require('express');
const friendController = require('../controllers/friendController');
const authController = require('../controllers/authController');

const router = express.Router();

// After this MW - only for logged in users
router.use(authController.protect);

router.post('/request/:recipient', friendController.requestToFriends);
router.patch('/accept/:requester', friendController.acceptToFriends);

// remove works same as reject
router.delete('/reject/:requester', friendController.deletefromFriends);

//get user friends
router.get('/me', friendController.getUserFriends);
router.get('/:id', friendController.getUserFriends);

module.exports = router;
