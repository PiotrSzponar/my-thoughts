const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getLoginUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `Hey ${req.user.name} - you are a logged in user!`
  });
};

exports.searchFriends = catchAsync(async (req, res, next) => {
  // user must send term in params
  const { term } = req.params;
  const users = await User.find({
    $or: [
      {
        name: { $regex: `${term}`, $options: 'i' }
      },
      {
        email: { $regex: `${term}`, $options: 'i' }
      }
    ],
    isHidden: false
  });

  if (!users.length) {
    return next(new AppError('No results', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'data searched',
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
