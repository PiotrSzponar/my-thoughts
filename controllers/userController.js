const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

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
