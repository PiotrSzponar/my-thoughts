const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs-extra');
const request = require('request');
const sharp = require('sharp');

const AppError = require('./../utils/appError');

const userSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      required: true
    },
    email: {
      type: String,
      unique: true
    },
    password: {
      type: String,
      select: false
    },
    passwordConfirm: {
      type: String
    },
    passwordChangedAt: Date,
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user'
    },
    name: {
      type: String
    },
    gender: {
      type: String
    },
    birthDate: {
      type: String
    },
    photo: {
      type: String,
      default: 'default.jpg',
      set: function(photo) {
        this._photo = this.photo;
        return photo;
      }
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
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Friend'
      }
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
      }
    ],
    isVerified: {
      type: Boolean,
      default: false,
      select: false
    },
    isHidden: {
      type: Boolean,
      default: false,
      select: false
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false
    },
    isCompleted: {
      type: Boolean,
      default: false,
      select: false
    },
    googleId: {
      type: String
    },
    facebookId: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Before save user to DB check if password filed was changed
// If was, hash password and remove passwordConfirm (we won't use it)
userSchema.pre('save', async function(next) {
  // only run this fn if password was actually modified
  if (!this.isModified('password')) return next();

  // hash the password with cost od 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// Remove old user photo before saving the new one
userSchema.pre('save', function(next) {
  if (!this.isModified('photo')) return next();

  const oldPhoto = this._photo;

  if (oldPhoto !== 'default.jpg') {
    fs.remove(`public/images/users/${oldPhoto}`, err => {
      if (err) return next(new AppError('Photo not found', 404));
    });
  }
  next();
});

// Save user photo from socials
userSchema.pre('save', function(next) {
  if (
    !this.isModified('photo') ||
    this.photo === 'default.jpg' ||
    !this.photo.startsWith('https')
  )
    return next();

  const fileName = `user-${this.id}-${Date.now()}.jpeg`;

  request({ url: this.photo, encoding: null }, function(err, res, bodyBuffer) {
    sharp(bodyBuffer)
      .resize(250, 250)
      .toFormat('jpeg')
      .jpeg({ quality: 60 })
      .toFile(`public/images/users/${fileName}`);
  });

  this.photo = fileName;
  next();
});

// Return only active and completed users when using 'find' methods
userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ isActive: { $ne: false } });
  next();
});

// Compare hashed passwords
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

const User = mongoose.model('User', userSchema);

User.collection.createIndex({ name: 'text', city: 'text', bio: 'text' });

module.exports = User;
