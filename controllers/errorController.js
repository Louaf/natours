const AppError = require('../utils/appError');
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}.`;
  return new AppError(message, 400);
};
const handleJWTError = () => {
  return new AppError('invalid token or expired please log in again!', 401);
};
const handleDuplicateDB = (err) => {
  const value = err.errmsg.match(/"(.*?)"/)[0];
  const message = `Duplicate field value ${value}. please use another value`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  //console.log('in the handler here ', err.errors);
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')} `;
  //console.log(message);
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  // A)API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // B)RENDERED WEBSITE
  console.log('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: err.message,
  });
};
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // Operational (handled) , Trusted error : send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //programming or unknown error : don't leak error information
    //1) log error
    console.log('ERROR 💥', err);
    //2)send generic message
    return res.status(500).json({
      status: 'fail',
      message: 'Something went wrong ',
    });
  }
  // B)Rendered website
  if (err.isOperational) {
    //console.log('hiiii');
    return res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: err.message,
    });
  }
  console.log('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: 'please try again later ',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'devolopment') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = {
      ...err,
      name: err.name,
      code: err.code,
      message: err.message,
    };
    //console.log('first :::', error.message, error.name);
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    )
      error = handleJWTError();
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateDB(error);
    if (error.name == 'ValidationError') error = handleValidationErrorDB(error);
    sendErrorProd(error, req, res);
  }
};
