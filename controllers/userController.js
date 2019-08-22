const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getLoginUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `Hey ${req.user.name} - you are a logged in user!`
  });
};

exports.search = catchAsync(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return next(new AppError('Search cannot be empty', 400));
  }

  const users = await User.find(
    {
      $text: { $search: q },
      _id: { $not: { $eq: req.user._id } },
      isHidden: false,
      isVerified: true
    },
    {
      score: { $meta: 'textScore' }
    }
  ).sort({ score: { $meta: 'textScore' } });

  if (!users.length) {
    return next(new AppError('No results', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Searched successfully',
    results: users.length,
    data: {
      users
    }
  });
});

exports.getAdmin = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `Hey ${req.user.name} - you have admin role!`
  });
};
