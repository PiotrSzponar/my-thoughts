const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const demoRouter = require('./routes/demoRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// GLOBAL MIDDLEWARES

// Set security HTTP headers
app.use(helmet());

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
app.use(cookieParser());

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
app.use('/', demoRouter);

// 404 - Not Found
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Try to handle all errors
app.use(globalErrorHandler);

module.exports = app;
