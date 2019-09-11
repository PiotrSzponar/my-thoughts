const express = require('express');
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');
const fileController = require('../controllers/fileController');

const router = express.Router();

// After this MW - only for logged in users
router.use(authController.protect);

// Find posts
router.get('/search', postController.search);

// Get wall of posts for user
// Create new post
router
  .route('/')
  .get(postController.getAllPostsForUser)
  .post(
    fileController.uploadPostPhotos,
    fileController.resizePostPhotos,
    postController.postValidator,
    postController.createPost
  );

// Get post by id
// Update own post by id
// Delete own post by id
router
  .route('/:id')
  .get(postController.getPost)
  .patch(
    fileController.uploadPostPhotos,
    fileController.resizePostPhotos,
    postController.updatePost
  )
  .delete(postController.deletePost);

// Change state of post to publish/draft
router.patch('/:id/publish', postController.publishPost);
router.patch('/:id/draft', postController.draftPost);

module.exports = router;
