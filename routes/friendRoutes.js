const express = require('express');
const friendController = require('../controllers/friendController');
const authController = require('../controllers/authController');

const router = express.Router();

// After this MW - only for logged in users
router.use(authController.protect);

router.post('/request', friendController.requestToFriends);
router.patch('/accept', friendController.acceptToFriends);

// remove works same as reject
router.delete('/reject', friendController.deletefromFriends);

//get user friends
router.get('/:id', friendController.getUserFriends);

module.exports = router;
