const { body, validationResult } = require('express-validator');
// const fs = require('fs');

// const User = require('../models/userModel');
const Post = require('../models/postModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

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

  // If there are spaces at input make alternative regexp like xxx|yyy|zzz
  const newReg = q.split(' ').join('|');

  // Search for full words
  let posts = await Post.find(
    {
      $text: { $search: q }
    },
    {
      score: { $meta: 'textScore' }
    }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(50);

  // If there are no full words search for part of word
  if (!posts.length) {
    posts = await Post.find({
      $or: [
        { title: { $regex: newReg, $options: 'gi' } },
        { content: { $regex: newReg, $options: 'gi' } },
        { tags: { $regex: newReg, $options: 'gi' } }
      ]
    }).limit(50);

    // If there is no full words or even part of them - no results
    if (!posts.length) {
      return next(new AppError('No results', 404));
    }
  }

  const results = posts.length;

  res.status(200).json({
    status: 'success',
    message: 'Searched successfully',
    results,
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
  const tags = req.body.tags.toLowerCase().split(' ');

  // TODO: Add photo

  const newPost = await Post.create({
    title: req.body.title,
    content: req.body.content,
    tags,
    privacy: req.body.privacy,
    author: req.user.id
  });

  newPost.author = undefined;
  newPost.isDeleted = undefined;

  res.status(201).json({
    status: 'success',
    message: 'Post created',
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
    select: 'name photo'
  });

  if (!post) {
    return next(new AppError('No post found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      post
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

  const filteredBody = filterObj(
    req.body,
    'title',
    'content',
    'photo',
    'privacy'
  );

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

  res.status(200).json({
    status: 'success',
    data: {
      post: updatedPost
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
    .custom(value => value.split(' ').length <= 10)
    .withMessage('Tags exceeds the limit of 10!')
];
