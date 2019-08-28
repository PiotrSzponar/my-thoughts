const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const Email = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

// Create JWT token that include ID, secret key from dev.env and expiration time (default 90d)
const signToken = (id, expiresTime = process.env.JWT_LOGIN_EXPIRES_IN) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: expiresTime });
};

// Create cookie with JWT token
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
  user.isActive = undefined;
  user.isCompleted = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};
exports.createTokenCookie = createTokenCookie;

// Check if user has required field
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // array ['admin', 'moderator'] or string role='admin'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.socialSignin = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Use social login!', 403));
  }
  createTokenCookie(req.user, 200, res);
});

// User registration with email address verification
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    method: 'local',
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    name: req.body.name,
    gender: req.body.gender,
    birthDate: req.body.birthDate,
    photo: req.body.photo,
    bio: req.body.bio,
    country: req.body.country,
    city: req.body.city,
    isCompleted: true
  });

  const verificationToken = signToken(
    newUser._id,
    process.env.JWT_VERIFICATION_EXPIRES_IN
  );

  const verificationURL = `${req.protocol}://${req.get(
    'host'
  )}/api/users/verification/${verificationToken}`;

  await new Email(newUser, verificationURL).sendVerification();

  newUser.password = undefined;
  newUser.isVerified = undefined;
  newUser.isHidden = undefined;
  newUser.isActive = undefined;

  res.status(201).json({
    status: 'success',
    message: 'User created and verification token sent to email!',
    data: {
      user: newUser
    },
    verificationToken
  });
});

// Email address verification
exports.verification = catchAsync(async (req, res, next) => {
  // Get user based on the token
  const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  // If token has not expired, and there is user, confirm verification
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  if (user.isVerified) {
    return next(new AppError('This user has already been verified', 400));
  }
  // Check if user used local login method
  if (user.method !== 'local') {
    return next(new AppError('User used social login', 400));
  }

  user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'User confirmed'
  });
});

// Resend email address verification with refreshed token
exports.resendVerification = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select(
    '+isVerified'
  );
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }
  if (user.isVerified) {
    return next(new AppError('This user has already been verified', 400));
  }
  // Check if user used local login method
  if (user.method !== 'local') {
    return next(new AppError('User used social login', 400));
  }

  const verificationToken = signToken(
    user._id,
    process.env.JWT_VERIFICATION_EXPIRES_IN
  );

  const verificationURL = `${req.protocol}://${req.get(
    'host'
  )}/api/users/verification/${verificationToken}`;

  await new Email(user, verificationURL).sendVerification();

  res.status(200).json({
    status: 'success',
    message:
      'Email verification has been resend. You have another 12h to confirm your email address.'
  });
});

// User login
exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select(
    '+password +isVerified +isActive'
  );

  // Check if user exists or password is correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  if (!user.isActive) {
    return next(new AppError('User is not active', 400));
  }
  if (!user.isVerified) {
    return next(new AppError('User is not verified', 400));
  }
  // Check if user used local login method
  if (user.method !== 'local') {
    return next(new AppError('User used social login', 400));
  }

  createTokenCookie(user, 200, res);
});

// User sign out - clear JWT cookie
exports.signout = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success' });
};

// Protect routes - only signed in users can get access
exports.protect = catchAsync(async (req, res, next) => {
  // Getting token and check of it's there
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // Verification token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id).select('+isCompleted');
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // Allow uncompleted user to enter only social-complete form
  const path = req.route === undefined ? '' : req.route.path;
  if (!currentUser.isCompleted && path !== '/signup/social-complete') {
    // Later this should redirect to form, now just error
    return next(new AppError('Complete user profile!', 401));
  }

  // Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // Gain access
  req.user = currentUser;
  next();
});

// Forgot Password: provide email and send there reset-password link
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on POST email
  const user = await User.findOne({ email: req.body.email }).select(
    '+isVerified'
  );
  if (user) {
    if (!user.isVerified) {
      return next(new AppError('User is not verified', 400));
    }
    // Check if user used local login method
    if (user.method !== 'local') {
      return next(new AppError('User used social login', 400));
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

// Find user by ID from token and change password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on the token
  const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  // If token has not expired, and there is user, change the password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  // Check if user used local login method
  if (user.method !== 'local') {
    return next(new AppError('User used social login', 400));
  }
  // Change password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // Save the date of password change
  user.passwordChangedAt = Date.now() - 1000;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password has been changed'
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // Check if user used local login method
  if (user.method !== 'local') {
    return next(new AppError('User used social login', 400));
  }

  // Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // Save the date of password change
  user.passwordChangedAt = Date.now() - 1000;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password has been changed'
  });
});
