const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide your e-mail.'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid e-mail.']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    validate: {
      validator: function (el) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(el);
      },
      message:
        'Password should contain: min 8 characters, at least one lower and upper case letter, one number and one special character.'
    },
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  name: {
    type: String,
    required: [
      true,
      'Name is required. It can be your real name or a nick name.'
    ],
    trim: true,
    maxlength: [30, 'Name can have less than 30 characters.']
  },
  gender: {
    type: String,
    enum: {
      values: ['female', 'male', 'other'],
      message: 'Please provide a valid gender.'
    },
    required: [true, 'Gender is required.']
  },
  birthDate: {
    type: String,
    required: [true, 'Birth date is required.'],
    validate: [
      validator.isBefore,
      'Please provide a valid birth date (should be in the past).'
    ]
  },
  photo: {
    type: String
  },
  bio: {
    type: String,
    maxlength: [250, 'Bio can have less than 250 characters.']
  },
  country: {
    type: String
  },
  city: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false,
    select: false
  },
  passwordChangedAt: Date
});

userSchema.pre('save', async function (next) {
  // only run this fn if password was actually modified
  if (!this.isModified('password')) return next();

  // hash the password with cost od 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const userGSchema = new mongoose.Schema({
  username: String,
  googleId: String
})


const User = mongoose.model('User', userSchema);
const UserG = mongoose.model('UserG', userGSchema);


module.exports = { User, UserG };