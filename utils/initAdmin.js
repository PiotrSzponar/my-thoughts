const User = require('../models/userModel').User;

// Check if any admin exists. If not, create default one.
module.exports = async () => {
  const user = await User.findOne({ 'role': 'admin' });
  console.log(user);
  if (!user) {
    console.log("robie usera admina")
    User.create({
      methods: 'local',
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
