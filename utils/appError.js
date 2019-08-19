// Make trusted errors that we wand to show to clients
class AppError extends Error {
  constructor(message, statusCode) {
    // super(message);
    super();

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.message = message;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
