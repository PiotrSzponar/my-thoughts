const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs-extra');
const uuidv4 = require('uuid/v4');

const AppError = require('./../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Save uploaded files to memory (temp)
const multerStorage = multer.memoryStorage();

// Pass only images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

// Init memory storage, filters and size limit to 3MB
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 3000000 }
});

// User photo
// Pass only 1 photo
exports.uploadUserPhoto = upload.single('photo');
// Filename: user-[user id]-[timestamp].jpeg
// Resize photo to 250x250, jpeg, quality 60% and save to image/users/
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
// Pass only 3 photos
exports.uploadPostPhotos = upload.array('photos', 3);
// Create temp dir: images/posts/[user id]/
// Temp filename: post-[uuid4]-[timestamp].jpeg
// Resize photo to 750x750, jpeg, quality 75% and save to temp dir
exports.resizePostPhotos = catchAsync(async (req, res, next) => {
  if (req.files.length === 0) return next();

  req.body.photos = [];

  fs.mkdirp(`public/images/posts/${req.user.id}`, err => {
    if (err) return next(new AppError('Directory create failed', 400));
  });

  await Promise.all(
    req.files.map(async file => {
      const fileName = `post-${uuidv4()}-${Date.now()}.jpeg`;

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
