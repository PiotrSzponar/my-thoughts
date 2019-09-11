const express = require('express');
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');
const fileController = require('../controllers/fileController');

const router = express.Router();

// After this MW - only for logged in users
router.use(authController.protect);

// Find posts
router.get('/search', postController.search);

router
  .route('/')
  .get(postController.getAllPostsForUser)
  .post(
    fileController.uploadPostPhotos,
    fileController.resizePostPhotos,
    postController.postValidator,
    postController.createPost
  );

router
  .route('/:id')
  .get(postController.getPost)
  .patch(
    fileController.uploadPostPhotos,
    fileController.resizePostPhotos,
    postController.updatePost
  )
  .delete(postController.deletePost);

router.patch('/:id/publish', postController.publishPost);
router.patch('/:id/draft', postController.draftPost);

module.exports = router;
