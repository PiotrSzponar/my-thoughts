const User = require('../models/userModel');

module.exports = async () => {
  const user = await User.findOne({ role: 'admin' });
  if (!user) {
    User.create({
      role: 'admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      passwordConfirm: process.env.ADMIN_PASSWORD,
      name: 'Administrator',
      gender: 'other',
      birthDate: new Date().toISOString().substring(0, 10),
      isVerified: true
    });
  }
};
