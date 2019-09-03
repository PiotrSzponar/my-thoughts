const User = require('../models/userModel');

// Check if any admin exists. If not, create default one.
module.exports = async () => {
  const user = await User.findOne({ role: 'admin' });
  if (!user) {
    User.create({
      method: 'local',
      role: 'admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      passwordConfirm: process.env.ADMIN_PASSWORD,
      name: 'Administrator',
      gender: 'other',
      birthDate: new Date().toISOString().substring(0, 10),
      isVerified: true,
      isHidden: true,
      isCompleted: true
    });
    console.log('Default Administrator has been created');
  }
};
