const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const Email = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = (id, expiresTime) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: expiresTime });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    name: req.body.name,
    gender: req.body.gender,
    birthDate: req.body.birthDate,
    photo: req.body.photo,
    bio: req.body.bio,
    country: req.body.country,
    city: req.body.city
  });

  const verificationToken = signToken(
    newUser._id,
    process.env.JWT_VERIFICATION_EXPIRES_IN
  );

  const verificationURL = `${req.protocol}://${req.get(
    'host'
  )}/api/users/verification/${verificationToken}`;

  await new Email(newUser, verificationURL).sendVerification();

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    },
    verificationToken,
    message: 'User created and verification token sent to email!'
  });
});

exports.verification = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  // 2) If token has not expired, and there is user, confirm verification
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'User confirmed'
  });
});
