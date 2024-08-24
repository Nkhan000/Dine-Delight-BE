const AppError = require('../utils/appError');
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value ${value} : Please use another value"`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data ${errors.join(' ')} : Please use another value"`;
  return new AppError(message, 400);
};

const handleJWTError = (err) =>
  new AppError('Invalid Token. Please login again', 401);

const handleJWTExpiredError = (err) =>
  new AppError('Your login token has expired. Please login again', 401);

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
const sendErrProd = (err, res) => {
  // operational errors made by client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR 💥', err);
    // programing or other unknown of error
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. please try again',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.errStatus = err.status || 'error';
  // console.log(process.env.NODE_ENV);

  if (process.env.NODE_ENV == 'development') {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV == 'production ') {
    let error = Object.assign(err);
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(error);

    sendErrProd(error, res);
  }
};
