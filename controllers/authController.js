// const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const Email = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = (id, expiresTime = process.env.JWT_LOGIN_EXPIRES_IN) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: expiresTime });
};

const createTokenCookie = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  // If production is https:
  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password and isVerified from output
  user.password = undefined;
  user.isVerified = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
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
  )}/verification?email=${newUser.email}&token=${verificationToken}`;

  await new Email(newUser, verificationURL).sendVerification();

  newUser.password = undefined;

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

exports.resendVerification = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }
  if (user.isVerified) {
    return next(new AppError('This user has already been verified', 400));
  }

  const verificationToken = signToken(
    user._id,
    process.env.JWT_VERIFICATION_EXPIRES_IN
  );

  const verificationURL = `${req.protocol}://${req.get(
    'host'
  )}/verification?email=${user.email}&token=${verificationToken}`;

  await new Email(user, verificationURL).sendVerification();

  res.status(200).json({
    status: 'success',
    message:
      'Email verification has been resend. You have another 12h to confirm your email address.'
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password +isVerified');

  // check if user exists or password is correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  if (!user.isVerified) {
    return next(new AppError('User is not verified', 400));
  }

  createTokenCookie(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on POST email
  const user = await User.findOne({ email: req.body.email }).select(
    '+isVerified'
  );
  if (user) {
    if (!user.isVerified) {
      return next(new AppError('User is not verified', 400));
    }
    // Generate token
    const resetToken = signToken(user._id, process.env.JWT_RESET_EXPIRES_IN);

    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/users/reset-password/${resetToken}`;

    // Send it to the user's email
    await new Email(user, resetURL).sendResetPassword();
  }

  res.status(200).json({
    status: 'success',
    message: 'Message with the next steps has been send to the provided email.'
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on the token
  const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  // If token has not expired, and there is user, change the password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  // Change password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // Save the date of password change
  user.passwordChangedAt = Date.now() - 1000;
  await user.save();

  // Log the user in, send JWT
  createTokenCookie(user, 200, res);
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

  // const decoded = promisify(jwt.verify(token, process.env.JWT_SECRET));
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
