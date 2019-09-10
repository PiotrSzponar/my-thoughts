const { body, validationResult } = require('express-validator');
const fs = require('fs-extra');

const User = require('../models/userModel');
const Post = require('../models/postModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

// Reduce req.body only to allowed fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

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
          privacy: 'public'
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
    author: req.user.id
  });

  // Add post photos
  if (req.files) {
    newPost.photos = req.body.photos;
    await newPost.save();
  }

  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $push: { posts: newPost._id } }
  );

  newPost.author = undefined;
  newPost.isDeleted = undefined;

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

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate({
    path: 'author',
    select: 'name photo',
    populate: {
      path: 'friends',
      select: 'recipient'
    }
  });

  // If post author is friend of user?
  const friend = !!post.author.friends.filter(
    obj => obj.recipient.toString() === req.user.id
  ).length;

  if (
    !post ||
    (req.user.role !== 'admin' &&
      post.privacy === 'private' &&
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
          privacy: 'public'
        },
        {
          author: user.id
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

exports.updatePost = catchAsync(async (req, res, next) => {
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

  const filteredBody = filterObj(req.body, 'title', 'content', 'privacy');

  if (req.body.tags) {
    filteredBody.tags = req.body.tags.toLowerCase().split(' ');
  }

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

  if (!updatedPost) {
    return next(new AppError('No post found to update', 404));
  }

  // // Delete photo
  // if (req.body.deletePhotos && req.body.deletePhotos === 'true') {
  //   fs.remove(`public/images/posts/${req.post.id}/`, err => {
  //     if (err) return next(new AppError('Photo not found', 404));
  //   });
  //   updatedPost.photos = [];
  //   await updatedPost.save();
  // }

  // Add post photos
  if (req.files.photos) {
    updatedPost.photos = req.body.photos;
    await updatedPost.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      post: updatedPost
    }
  });
});

exports.addPhotos = catchAsync(async (req, res, next) => {
  // Add post photos
  if (req.files.photos) {
    req.post.photos = req.body.photos;
    await req.post.save();
  }

  req.post.author = undefined;
  req.post.isDeleted = undefined;

  res.status(200).json({
    status: 'success',
    message: 'Thanks for sharing your thoughts!',
    data: {
      author: {
        id: req.user.id,
        name: req.user.name,
        photo: req.user.photo
      },
      post: req.post
    }
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (req.user.role === 'admin') {
    await post.deleteOne();

    return res.status(200).json({
      status: 'success',
      message: 'Post deleted'
    });
  }

  if (post.author.toString() !== req.user.id) {
    return next(new AppError('You can delete only own posts', 400));
  }

  await post.updateOne({
    isDeleted: true
  });

  res.status(200).json({
    status: 'success',
    message: 'Post deleted',
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
