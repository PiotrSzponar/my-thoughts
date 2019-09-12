const { validationResult } = require('express-validator');
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

// Search users by name, city or bio
exports.search = catchAsync(async (req, res, next) => {
  const q = req.query.q.trim();

  if (!q) {
    return next(new AppError('Search cannot be empty.', 400));
  }
  if (q.length < 3) {
    return next(new AppError('Search require at least 3 characters.', 400));
  }

  // If there are spaces at input make alternative regexp like xxx|yyy|zzz
  const newReg = q.split(' ').join('|');

  // Search for full words
  let users = await User.find(
    {
      $text: { $search: q },
      _id: { $not: { $eq: req.user._id } },
      isHidden: false,
      isVerified: true,
      isActive: true,
      isCompleted: true
    },
    {
      score: { $meta: 'textScore' }
    }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(50);

  // If there are no full words search for part of word
  if (!users.length) {
    users = await User.find({
      $or: [
        { name: { $regex: newReg, $options: 'gi' } },
        { city: { $regex: newReg, $options: 'gi' } },
        { bio: { $regex: newReg, $options: 'gi' } }
      ],
      _id: { $not: { $eq: req.user._id } },
      isHidden: false,
      isVerified: true,
      isActive: true,
      isCompleted: true
    }).limit(50);

    // If there is no full words or even part of them - no results
    if (!users.length) {
      return next(new AppError('No results', 404));
    }
  }

  const results = users.length;

  res.status(200).json({
    status: 'success',
    message: 'Searched successfully',
    results,
    data: {
      users
    }
  });
});

// Show current user
// With role user:
//  - get id from req.user/params and show basic info about user
//  - get only 6 sample friends and number of all user friends
exports.getUser = catchAsync(async (req, res, next) => {
  const user =
    req.route.path === '/me'
      ? await User.findById(req.user.id).populate({
          path: 'friends',
          options: { sort: { updatedAt: 'desc' } }
        })
      : await User.findById(req.params.id)
          .populate({
            path: 'friends',
            options: { sort: { updatedAt: 'desc' } }
          })
          .select(
            `${
              req.user.role === 'admin'
                ? '+isHidden +isVerified +isActive +isCompleted'
                : '-isHidden -isVerified -isActive -isCompleted'
            }`
          );

  if (!user) {
    return next(new AppError('No user found', 404));
  }

  const friendsList = user.friends
    .filter(el => el.status === 3)
    .map(obj => ({
      userId: obj.recipient,
      name: obj.name
    }))
    .slice(0, 6);

  res.status(200).json({
    status: 'success',
    data: {
      ...user._doc,
      friendsCount: user.friends.length,
      friends: friendsList
    }
  });
});

// Update user profile
// With role user:
//  - get id from req.user and allow to change gender, birth date, photo, bio, country, city or isHidden
// With role admin:
//  - get user id from params and allow to change everything except password
exports.updateUser = catchAsync(async (req, res, next) => {
  // Create error if user POSTs password data
  if (
    req.route.path === '/me' &&
    (req.body.password || req.body.passwordConfirm)
  ) {
    return next(new AppError('This route is not for password updates.', 400));
  }

  // Filtered out unwanted fields names that are not allowed to be updated, remove empties
  const filteredBody =
    req.route.path === '/me' &&
    filterObj(req.body, 'bio', 'country', 'city', 'isHidden', 'deletePhoto');
  if (req.body.name) filteredBody.name = req.body.name;
  if (req.body.gender) filteredBody.gender = req.body.gender;
  if (req.body.birthDate) filteredBody.birthDate = req.body.birthDate;

  // Update user document and returned the new one
  const updatedUser =
    req.user.role === 'admin' && req.route.path !== '/me'
      ? await User.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
        }).select('+isHidden +isVerified +isActive')
      : await User.findByIdAndUpdate(req.user.id, filteredBody, {
          new: true,
          runValidators: true
        });

  if (!updatedUser) {
    return next(new AppError('No user found', 404));
  }

  // Add user photo
  if (req.file) {
    updatedUser.photo = req.file.filename;
    await updatedUser.save();
  }

  // Delete photo
  if (
    updatedUser.photo !== 'default.jpg' &&
    req.body.deletePhoto &&
    req.body.deletePhoto === 'true'
  ) {
    fs.remove(`public/images/users/${updatedUser.photo}`, err => {
      if (err) return next(new AppError('Photo not found', 404));
    });
    updatedUser.photo = 'default.jpg';
    await updatedUser.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Complete user profile after signup
// Every user (no matter what login method was used) ends with the same filled profile
exports.completeProfile = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Login first!', 403));
  }
  // There is another way to update user profile
  // Return error if completed user wants to change something in this way
  if (req.user.isCompleted) {
    return next(
      new AppError(
        'Your profile is completed. This is not for updating user profile.',
        403
      )
    );
  }
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
  // Filtered out unwanted fields names that are not allowed to be updated, remove empties
  const filteredBody =
    req.route.path === '/me' &&
    filterObj(
      req.body,
      'gender',
      'birthDate',
      'bio',
      'country',
      'city',
      'isHidden',
      'deletePhoto'
    );
  if (req.body.name) filteredBody.name = req.body.name;

  // Mark user profile as completed
  filteredBody.isCompleted = true;

  // Provide the changes
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  // Add user photo
  if (req.file) {
    user.photo = req.file.filename;
    await user.save();
  }

  // Delete photo
  if (req.body.deletePhoto && req.body.deletePhoto === 'true') {
    fs.remove(`public/images/users/${user.photo}`, err => {
      if (err) return next(new AppError('Photo not found', 404));
    });
    user.photo = 'default.jpg';
    await user.save();
  }

  res.status(201).json({
    status: 'success',
    message: 'User profile completed',
    data: {
      user
    }
  });
});

// Delete (deactivate) user
// With role user:
//  - deactivate to hide everything from user and logout
// With role admin:
//  - delete user from DB
exports.deleteUser = catchAsync(async (req, res, next) => {
  let user = null;

  // Check if admin wants to delete/deactivate himself
  if (req.user.role === 'admin' && req.route.path === '/me') {
    return next(new AppError('Can not delete/deactivate admin', 400));
  }

  if (req.user.role === 'admin' && req.route.path !== '/me') {
    user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }
  } else {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });
  }

  const userAction = user === null ? 'deactivated' : 'deleted';

  res.status(200).json({
    status: 'success',
    message: `User ${userAction}`,
    data: user
  });
});

// Get appropriate post from logged in or provided user
exports.getUserPosts = catchAsync(async (req, res, next) => {
  const userId = req.route.path === '/me/posts' ? req.user.id : req.params.id;

  const user = await User.findById(req.user.id).populate({
    path: 'friends',
    select: 'recipient'
  });

  const userFriends = user.friends.map(obj => obj.recipient);

  const features = new APIFeatures(
    Post.find({
      author: userId,
      $or: [
        {
          $and: [{ privacy: 'public' }, { state: 'publish' }]
        },
        {
          $and: [{ state: 'draft' }, { author: user.id }]
        },
        {
          $and: [{ privacy: 'private' }, { author: req.user.id }]
        },
        {
          $and: [
            { privacy: 'friends' },
            { $or: [{ author: userFriends }, { author: req.user.id }] }
          ]
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

// Only for Admin (full access)

// Get all users with filtering, sorting, limit fields and pagination (utils/apiFeatures.js)
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    User.find()
      .populate('friends')
      .select('+isHidden +isVerified +isActive +isCompleted'),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await features.query;

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      data: users
    }
  });
});

// Create new user with full access
exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    method: req.body.method,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    name: req.body.name,
    gender: req.body.gender,
    birthDate: req.body.birthDate,
    photo: req.file ? req.file.filename : 'default.jpg',
    bio: req.body.bio,
    country: req.body.country,
    city: req.body.city,
    role: req.body.role,
    isVerified: req.body.isVerified,
    isHidden: req.body.isHidden,
    isActive: req.body.isActive,
    isCompleted: req.body.isCompleted
  });

  res.status(201).json({
    status: 'success',
    message: 'User created',
    data: {
      user: newUser
    }
  });
});
