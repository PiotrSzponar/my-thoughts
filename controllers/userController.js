const User = require('../models/userModel');
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
      isVerified: true
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
      isVerified: true
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
//  - get id from req.user and show basic info about logged in user
// With role admin:
//  - get user id from params and show all info about user
exports.getUser = catchAsync(async (req, res, next) => {
  const searchedUser =
    req.user.role === 'admin'
      ? await User.findById(req.params.id).select(
          '+isHidden +isVerified +isActive'
        )
      : await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      searchedUser
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
    req.user.role !== 'admin' &&
    (req.body.password || req.body.passwordConfirm)
  ) {
    return next(new AppError('This route is not for password updates.', 400));
  }

  // Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody =
    req.user.role !== 'admin' &&
    filterObj(
      req.body,
      'gender',
      'birthDate',
      'photo',
      'bio',
      'country',
      'city',
      'isHidden'
    );

  // Update user document and returned the new one
  const updatedUser =
    req.user.role === 'admin'
      ? await User.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
        }).select('+isHidden +isVerified +isActive')
      : await User.findByIdAndUpdate(req.user.id, filteredBody, {
          new: true,
          runValidators: true
        });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
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
  if (req.user.role === 'admin') {
    user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }
  } else {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });
    res.clearCookie('jwt');
  }

  const userAction = user === null ? 'deactivated' : 'deleted';

  res.status(200).json({
    status: 'success',
    message: `User ${userAction}`,
    data: user
  });
});

// Only for Admin (all access)

// Get all users with filtering, sorting, limit fields and pagination (utils/apiFeatures.js)
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    User.find().select(
      `${!req.query.fields && '+isHidden +isVerified +isActive'}`
    ),
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
