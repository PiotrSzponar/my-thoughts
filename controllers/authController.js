const { promisify } = require('util');
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
  if (user.isVerified) {
    return next(new AppError('This user has already been verified', 400));
  }
  user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'User confirmed'
  });
});

exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  // check if user exists or password is correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  if (!user.isVerified) {
    return next(new AppError('User is not verified', 400));
  }
  const token = signToken(user._id, process.env.JWT_LOGIN_EXPIRES_IN);

  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in', 401));
  }

  const decoded = promisify(jwt.verify(token, process.env.JWT_SECRET));

});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};
