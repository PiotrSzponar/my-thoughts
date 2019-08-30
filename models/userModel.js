const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  { timestamps: true }
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

// Return only active and completed users when using 'find' methods
userSchema.pre(/^find/, function(next) {
  this.find({
    isActive: { $ne: false },
    isCompleted: { $ne: false }
  });
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
