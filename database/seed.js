const User = require('../models/userModel');

const seed = {
  role: 'admin',
  email: 'admin@my-thoughts.com',
  password: 'Admin12#$',
  passwordConfirm: 'Admin12#$',
  name: 'Administrator',
  gender: 'male',
  birthDate: '1994-12-05',
  photo: 'photo.jpg',
  bio: 'description',
  country: 'poland',
  city: 'gliwice'
};

exports.module = cb => {
  const user = User.findOne({ email: seed.email });

  if (!user) {
    User.create(
      {
        role: seed.role,
        email: seed.email,
        password: seed.password,
        passwordConfirm: seed.passwordConfirm,
        name: seed.name,
        gender: seed.gender,
        birthDate: seed.birthDate,
        photo: seed.photo,
        bio: seed.bio,
        country: seed.country,
        city: seed.city
      },
      {
        validateBeforeSave: false
      }
    );
  }

  return cb();
};
