const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const cookieParser = require('cookie-parser');
const passport = require('passport');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoutes');
const friendRouter = require('./routes/friendRoutes');

// eslint-disable-next-line no-unused-vars
const passportSetup = require('./utils/initPassport');

const app = express();

const corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};

app.use(cors(corsOption));

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
app.use('/api/friends', friendRouter);
// 404 - Not Found
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Try to handle all errors
app.use(globalErrorHandler);

module.exports = app;
