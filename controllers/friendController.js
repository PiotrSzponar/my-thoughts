const { ObjectID } = require('mongodb');
const User = require('../models/userModel');
const Friend = require('../models/friendsModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

const isValidID = id => ObjectID.isValid(id);

// send friend request e.g route: /api/friends/request-friend?recipient="recpipient id"
exports.requestToFriends = catchAsync(async (req, res, next) => {
  // check if id isvalid, isFriend doesn't handle that
  if (!isValidID(req.query.recipient)) {
    return next(new AppError('No user found', 404));
  }

  // check if User is already your friend

  //add when user deleted, remove also friends relations
  const isFriend = await Friend.find({
    requester: req.user._id,
    recipient: req.query.recipient,
    status: 3
  });

  // check status
  if (isFriend.length) {
    return next(new AppError('This User is your friend', 401));
  }

  const docA = await Friend.findOneAndUpdate(
    { requester: req.user._id, recipient: req.query.recipient },
    { $set: { status: 1 } },
    { upsert: true, new: true }
  );

  const docB = await Friend.findOneAndUpdate(
    { recipient: req.user._id, requester: req.query.recipient },
    { $set: { status: 2 } },
    { upsert: true, new: true }
  );

  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $push: { Friends: docA._id } }
  );

  await User.findOneAndUpdate(
    { _id: req.query.recipient },
    { $push: { Friends: docB._id } }
  );

  const data = await Friend.find();

  res.status(200).json({
    status: 'success',
    message: 'Your request has been sent',
    data: {
      data
    }
  });
});

// accept friend request e.g route: /api/friends/accept-friend?requester="requester id"
exports.acceptToFriends = catchAsync(async (req, res, next) => {
  if (!isValidID(req.query.requester)) {
    return next(new AppError('No user found', 404));
  }

  //add when user deleted, remove also friends relations
  const isFriend = await Friend.find({
    requester: req.query.requester,
    recipient: req.user._id,
    status: 3
  });

  // check status
  if (isFriend.length) {
    return next(new AppError('This User is your friend', 401));
  }

  await Friend.findOneAndUpdate(
    { requester: req.query.requester, recipient: req.user._id },
    { $set: { status: 3 } },
    { new: true }
  );

  await Friend.findOneAndUpdate(
    { recipient: req.query.requester, requester: req.user._id },
    { $set: { status: 3 } },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'You are friends now'
  });
});

exports.deletefromFriends = catchAsync(async (req, res, next) => {
  if (!isValidID(req.query.requester)) {
    return next(new AppError('No user found', 404));
  }

  const docA = await Friend.findOneAndRemove({
    requester: req.user._id,
    recipient: req.query.requester
  });

  const docB = await Friend.findOneAndRemove({
    recipient: req.user._id,
    requester: req.query.requester
  });

  // if friends not find
  if (docA === null || docB === null) {
    return next(new AppError('You are not friends', 404));
  }

  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $pull: { Friends: docA._id } },
    { new: true }
  );

  await User.findOneAndUpdate(
    { _id: req.query.requester },
    { $pull: { Friends: docB._id } },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'You are not friends now'
  });
});
