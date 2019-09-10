const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs-extra');

const AppError = require('./../utils/appError');
const catchAsync = require('../utils/catchAsync');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 1000000 }
});

// User photo

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(250, 250)
    .toFormat('jpeg')
    .jpeg({ quality: 60 })
    .toFile(`public/images/users/${req.file.filename}`);

  next();
});

// Post photos

exports.uploadPostPhotos = upload.array('photos', 3);

exports.resizePostPhotos = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  req.body.photos = [];

  await fs.mkdirp(`public/images/posts/${req.user.id}`, err => {
    if (err) return next(new AppError('Directory create failed', 400));
  });

  await Promise.all(
    req.files.map(async (file, i) => {
      const fileName = `post-${req.user.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(750, 750)
        .toFormat('jpeg')
        .jpeg({ quality: 75 })
        .toFile(`public/images/posts/${req.user.id}/${fileName}`);

      req.body.photos.push(fileName);
    })
  );

  next();
});
