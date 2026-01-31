const mongoose = require('mongoose');
const crypto = require('crypto');
const valditor_1 = require('validator');
const bcrypt = require('bcryptjs');
const { type } = require('os');
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    //validate: [valditor_1.isAlpha, 'tour name must only contain characters '],
  },
  email: {
    type: String,
    required: [true, 'A user must have a email'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [valditor_1.isEmail, 'this is supposed to be a real email'],
  },
  photo: {
    default: 'default.jpg',
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'enter your password '],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'enter your password again '],
    validate: {
      //this only works on save and create
      validator: function (el) {
        return el === this.password;
      },
      message: 'come on man give me the same password.',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  PasswordResetToken: String,
  PasswordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Middlewares

userSchema.pre('save', async function (next) {
  // Only run this function if password was modified
  if (!this.isModified('password')) return next();

  // hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // delete the passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//instance Methods
userSchema.methods.correctPassword = async function (candidatePassword) {
  //console.log(candidatePassword, '     ', this.password);
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return changedTimestamp > JWTTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.PasswordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.PasswordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log(
    'in the method we got : ',
    { resetToken },
    this.PasswordResetToken,
  );
  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
