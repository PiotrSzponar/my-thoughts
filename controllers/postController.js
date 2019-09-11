const { body, validationResult } = require('express-validator');
const fs = require('fs-extra');

const User = require('../models/userModel');
const Post = require('../models/postModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

// Search posts by title, content or tags
exports.search = catchAsync(async (req, res, next) => {
  const q = req.query.q ? req.query.q.trim() : undefined;

  if (!q) {
    return next(new AppError('Search cannot be empty.', 400));
  }
  if (q.length < 3) {
    return next(new AppError('Search require at least 3 characters.', 400));
  }

  const user = await User.findById(req.user.id).populate({
    path: 'friends',
    select: 'recipient'
  });

  const userFriends = user.friends.map(obj => obj.recipient);

  // Search
  const posts = await Post.find(
    {
      $text: { $search: q },
      $or: [
        {
          $and: [{ privacy: 'public' }, { state: 'publish' }]
        },
        {
          author: req.user.id
        },
        {
          $and: [{ privacy: 'friends' }, { author: userFriends }]
        }
      ]
    },
    {
      score: { $meta: 'textScore' }
    }
  )
    .sort({ score: { $meta: 'textScore' }, updatedAt: -1 })
    .limit(50);

  if (!posts.length) {
    return next(new AppError('No results', 404));
  }

  posts.forEach(post => {
    if (post.author.toString() === user.id) {
      post._doc.from = 'myself';
    } else if (
      post.privacy === 'friends' ||
      (post.privacy === 'public' && userFriends.includes(post.author))
    ) {
      post._doc.from = 'friend';
    } else {
      post._doc.from = 'stranger';
    }
  });

  res.status(200).json({
    status: 'success',
    message: 'Searched successfully',
    results: posts.length,
    data: {
      posts
    }
  });
});

// Create new post
exports.createPost = catchAsync(async (req, res, next) => {
  // Validation errors
  if (!validationResult(req).isEmpty()) {
    return next(
      new AppError(
        'Validation failed!',
        422,
        validationResult(req)
          .formatWith(({ msg }) => msg)
          .mapped()
      )
    );
  }
  const tags = req.body.tags
    ? req.body.tags.toLowerCase().split(' ')
    : undefined;

  const newPost = await Post.create({
    title: req.body.title,
    content: req.body.content,
    tags,
    privacy: req.body.privacy,
    author: req.user.id,
    state: req.body.state
  });

  // Add post photos
  if (req.files.length > 0) {
    const newPhotos = [];

    await Promise.all(
      req.body.photos.map(async (photo, i) => {
        const fileName = `post-${newPost.id}-${Date.now()}-${i + 1}.jpeg`;
        fs.move(
          `public/images/posts/${req.user.id}/${photo}`,
          `public/images/posts/${newPost.id}/${fileName}`,
          err => {
            if (err) return next(new AppError('Move files error!', 404));
          }
        );
        newPhotos.push(fileName);
      })
    );

    newPost.photos = newPhotos;
    await newPost.save();

    fs.remove(`public/images/posts/${req.user.id}`, err => {
      if (err) return next(new AppError('Directory not found', 404));
    });
  }

  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $push: { posts: newPost._id } }
  );

  newPost.author = undefined;

  res.status(200).json({
    status: 'success',
    message: 'Thanks for sharing your thoughts!',
    data: {
      author: {
        id: req.user.id,
        name: req.user.name,
        photo: req.user.photo
      },
      post: newPost
    }
  });
});

// Show appropriate post to user
exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate({
    path: 'author',
    select: 'name photo',
    populate: {
      path: 'friends',
      select: 'recipient'
    }
  });

  if (!post) {
    return next(new AppError('No post found to show.', 404));
  }

  // If post author is friend of user?
  const friend = !!post.author.friends.filter(
    obj => obj.recipient.toString() === req.user.id
  ).length;

  if (
    (req.user.role !== 'admin' &&
      (post.privacy === 'private' || post.state === 'draft') &&
      post.author.id.toString() !== req.user.id) ||
    (req.user.role !== 'admin' && post.privacy === 'friends' && !friend)
  ) {
    return next(new AppError('Post not found', 404));
  }

  post.author.friends = undefined;

  res.status(200).json({
    status: 'success',
    data: {
      post
    }
  });
});

// Post wall
exports.getAllPostsForUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: 'friends',
    select: 'recipient'
  });

  const userFriends = user.friends.map(obj => obj.recipient);

  const features = new APIFeatures(
    Post.find({
      $or: [
        {
          $and: [{ privacy: 'public' }, { state: 'publish' }]
        },
        {
          author: user.id
        },
        {
          $and: [{ state: 'draft' }, { author: user.id }]
        },
        {
          $and: [{ privacy: 'friends' }, { author: userFriends }]
        }
      ]
    }).sort({ updatedAt: -1 }),
    req.query
  ).paginate();

  const posts = await features.query;

  posts.forEach(post => {
    if (post.author.toString() === user.id) {
      post._doc.from = 'myself';
    } else if (
      post.privacy === 'friends' ||
      (post.privacy === 'public' && userFriends.includes(post.author))
    ) {
      post._doc.from = 'friend';
    } else {
      post._doc.from = 'stranger';
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      posts
    }
  });
});

// Update own post
exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post found to update', 404));
  }

  if (post.author.toString() !== req.user.id) {
    return next(new AppError('You can update only own posts.', 400));
  }

  const filteredBody = {};
  if (req.body.title) filteredBody.title = req.body.title;
  if (req.body.content) filteredBody.content = req.body.content;
  if (req.body.privacy) filteredBody.privacy = req.body.privacy;
  if (req.body.tags) filteredBody.tags = req.body.tags.toLowerCase().split(' ');
  if (req.body.deletePhotos) filteredBody.deletePhotos = req.body.deletePhotos;
  if (req.body.state) filteredBody.state = req.body.state;

  // Update post document and returned the new one
  const updatedPost =
    req.user.role === 'admin'
      ? await Post.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
        })
      : await Post.findByIdAndUpdate(req.params.id, filteredBody, {
          new: true,
          runValidators: true
        });

  // Delete old files and add new ones
  if (req.files.length > 0) {
    await Promise.all(
      updatedPost.photos.map(async photo => {
        await fs.remove(`public/images/posts/${updatedPost.id}/${photo}`);
      })
    );

    const newPhotos = [];

    await Promise.all(
      req.body.photos.map(async (photo, i) => {
        const fileName = `post-${updatedPost.id}-${Date.now()}-${i + 1}.jpeg`;
        await fs.move(
          `public/images/posts/${req.user.id}/${photo}`,
          `public/images/posts/${updatedPost.id}/${fileName}`
        );
        newPhotos.push(fileName);
      })
    );

    updatedPost.photos = newPhotos;
    await updatedPost.save();

    fs.remove(`public/images/posts/${req.user.id}`, err => {
      if (err) return next(new AppError('Directory not found.', 404));
    });
  }

  // Delete photos
  if (req.body.deletePhotos && req.body.deletePhotos === 'true') {
    fs.remove(`public/images/posts/${updatedPost.id}`, err => {
      if (err) return next(new AppError('Directory not found.', 404));
    });
    updatedPost.photos = [];
    await updatedPost.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      post: updatedPost
    }
  });
});

// Delete post
// User can hide post (state: delete)
// Admin can remove post from DB
exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post found to delete', 404));
  }

  if (req.user.role === 'admin') {
    await post.deleteOne();

    return res.status(200).json({
      status: 'success',
      message: 'Post deleted'
    });
  }

  if (post.author.toString() !== req.user.id) {
    return next(new AppError('You can delete only own posts.', 400));
  }

  await post.updateOne({
    state: 'delete'
  });

  post.state = 'delete';

  res.status(200).json({
    status: 'success',
    message: 'Post deleted',
    data: post
  });
});

// Change post state to publish
exports.publishPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post found to publish.', 404));
  }

  if (post.author.toString() !== req.user.id) {
    return next(new AppError('You can publish only own posts', 400));
  }
  if (post.state !== 'draft') {
    return next(
      new AppError('Can not publish posts which are not draft.', 400)
    );
  }

  await post.updateOne({ state: 'publish' });

  post.state = 'publish';

  res.status(200).json({
    status: 'success',
    message: 'Post has been published!',
    data: post
  });
});

// Change post state to draft
exports.draftPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post found to draft.', 404));
  }

  if (post.author.toString() !== req.user.id) {
    return next(new AppError('You can draft only own posts', 400));
  }
  if (post.state !== 'publish') {
    return next(
      new AppError('Can not draft posts which are not publish.', 400)
    );
  }

  await post.updateOne({ state: 'draft' });

  post.state = 'draft';

  res.status(200).json({
    status: 'success',
    message: 'Post has been drafted!',
    data: post
  });
});

// Validators

exports.postValidator = [
  body('title')
    .not()
    .isEmpty()
    .withMessage('Please provide post title!'),
  body('content')
    .not()
    .isEmpty()
    .withMessage('Please provide post content!'),
  body('tags')
    .custom(value => (value ? value.split(' ').length <= 10 : true))
    .withMessage('Tags exceeds the limit of 10!')
];
