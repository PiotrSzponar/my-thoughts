const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const passport = require('passport');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoutes');
const friendRouter = require('./routes/friendRoutes');
const postRouter = require('./routes/postRoutes');

const passportSetup = require('./utils/initPassport');

const app = express();

// GLOBAL MIDDLEWARES

// Initialize Passport MW
app.use(passport.initialize());

// Set security HTTP headers
app.use(helmet());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit number of requests to API from one IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
// e.g. login with invalid email { "$gt": ""} (always true) and valid password won't pass
app.use(mongoSanitize());

// Data sanitization against XSS
// Convert HTML code from inputs to plain text (<div> to &alt;div>)
app.use(xssClean());

// TODO: Prevent parameter pollution
// - Add parameters that could be doubled in query search
app.use(
  hpp({
    whitelist: [
      // 'example'
    ]
  })
);

// ROUTES
app.use('/api/users', userRouter);
app.use('/api/friends', friendRouter);
app.use('/api/posts', postRouter);

// 404 - Not Found
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Try to handle all errors
app.use(globalErrorHandler);

module.exports = app;
