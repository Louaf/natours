const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = false;

  res.cookie('jwt', token, cookieOptions);
  //remove the password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  //console.log('hi');
  //console.log(req.body.passwordChangedAt);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //console.log(email, password);
  // 1) check if email and password exist int the request
  if (!email || !password)
    return next(
      new AppError('please enter your email and your password!', 400)
    );
  // 2) Check if user exists && password is correct

  const user = await User.findOne({ email }).select('+password');
  //console.log(user, password);
  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('wrong email or password !', 401));
  }
  //console.log(email, password);
  //console.log(user);
  createAndSendToken(user, 200, res);
});
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
exports.protect = catchAsync(async (req, res, next) => {
  //1)Getting the token and check if it exists
  let token;
  //console.log('hi first ');
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  //console.log(token);
  if (!token) {
    return next(
      new AppError('you are not logged in ! please log in to get access', 401)
    );
  }
  //2)verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);

  //3)Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(
      new AppError('the user belonging to this token no longer exists ', 401)
    );

  //4) check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password please log in again !', 401)
    );
  }

  // Grant access to PROTECTED ROUTE
  res.locals.user = freshUser;
  req.user = freshUser;
  next();
});
// only for rendered pages and there will be no error
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      // 1) verify the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //2)Check if user still exists
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) return next();

      //3) check if user changed password after the token was issued
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      // there is a logged in user
      res.locals.user = freshUser;
    }
    next();
  } catch (err) {
    next();
  }
};
module.exports.restrictTo = (...roles) => {
  // roles = ['admin' , 'lead-guide']
  return (req, res, next) => {
    console.log(req.user);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`you don't have permission to perform this action`, 403)
      );
    }
    next();
  };
};

module.exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) get user based on POSTED email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    //console.log('djakshdfksdlahjflksjdhgflsidhj');
    return next(new AppError('this email is not registered', 404));
  }
  //2)create reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3)send it to email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `forgot your password ? send a patch request with the password and the passwordConfirm to
  : ${resetURL}.\nif you didn't forget yyour password , please ignore this email `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'your password token is valid for 10 min',
      message,
    });
    //console.log('hi');

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    console.log(err);
    user.PasswordResetToken = undefined;
    user.PasswordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('there was an error sending the email ,try again later', 500)
    );
  }
});

module.exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    PasswordResetToken: hashedToken,
    PasswordResetExpires: { $gt: Date.now() },
  });

  //2) if token not expired ,and there is user , set the new password
  if (!user) return next(new AppError('token is invalid or has expired ', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.PasswordResetToken = undefined;
  user.PasswordResetExpires = undefined;

  await user.save();
  //3) update changedPasswodAt property for the user

  //4) log the user in send jwt
  createAndSendToken(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get user from collection
  // it's already there because protect
  const user = await User.findById(req.user.id).select('+password');
  // 2) check if POSTed password is correct
  if (!(await user.correctPassword(req.body.oldPassword))) {
    return next(
      new AppError('wrong password ,please enter the correct password', 401)
    );
  }
  // 3) update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.PasswordResetToken = undefined;
  user.PasswordResetExpires = undefined;

  await user.save();
  // 4) log the user in , sen JWT
  createAndSendToken(user, 200, res);
});
