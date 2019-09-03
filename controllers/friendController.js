const { ObjectID } = require('mongodb');
const User = require('../models/userModel');
const Friend = require('../models/friendsModel');

const Email = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

const isValidID = id => ObjectID.isValid(id);

// send friend request e.g route: /api/friends/request?recipient="recpipient id"
exports.requestToFriends = catchAsync(async (req, res, next) => {
  // check if provided query is ObjectID
  if (!isValidID(req.query.recipient))
    return next(new AppError('No user found', 404));

  // check if User is already your friend
  const isFriend = await Friend.findOne({
    requester: req.user._id,
    recipient: req.query.recipient
  });

  if (req.query.recipient === req.user._id.toString())
    return next(new AppError("You can't add yourself to friends", 403));
  // check status
  if (isFriend && isFriend.status === 3)
    return next(new AppError('This User is your friend', 403));

  if (isFriend && isFriend.status === 2)
    return next(new AppError('This User has invited you to friends', 403));

  if (isFriend && isFriend.status === 1)
    return next(new AppError('You already sent an invitation', 403));

  const recipient = await User.findOne({ _id: req.query.recipient }).select(
    '+isVerified'
  );

  if (!recipient.isVerified)
    return next(new AppError('User you want to invite is not verified', 400));

  const docA = await Friend.findOneAndUpdate(
    { requester: req.user._id, recipient: req.query.recipient },
    { $set: { status: 1, name: recipient.name } },
    { upsert: true, new: true }
  );

  const docB = await Friend.findOneAndUpdate(
    { recipient: req.user._id, requester: req.query.recipient },
    { $set: { status: 2, name: req.user.name } },
    { upsert: true, new: true }
  );

  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $push: { friends: docA._id } }
  );

  await User.findOneAndUpdate(
    { _id: req.query.recipient },
    { $push: { friends: docB._id } }
  );

  const acceptURL = `${req.protocol}://${req.get(
    'host'
  )}/api/friends/accept?requester=${req.user._id}`;

  const rejectURL = `${req.protocol}://${req.get(
    'host'
  )}/api/friends/reject?requester=${req.user._id}`;

  await new Email(recipient, '', {
    state: 'pending',
    name: req.user.name,
    accept: acceptURL,
    reject: rejectURL
  }).sendFriendInvitation();

  res.status(200).json({
    status: 'success',
    message: 'Your request has been sent'
  });
});

// accept friend request e.g route: /api/friends/accept?requester="requester id"
exports.acceptToFriends = catchAsync(async (req, res, next) => {
  if (!isValidID(req.query.requester))
    return next(new AppError('No user found', 404));

  if (req.query.recipient === req.user._id.toString())
    return next(new AppError("You can't accept your invitation", 403));

  const isFriend = await Friend.findOne({
    requester: req.query.requester,
    recipient: req.user._id,
    $or: [{ status: 3 }, { status: 2 }, { status: 1 }]
  });

  // check status
  if (isFriend && isFriend.status === 3)
    return next(new AppError('This User is already your friend', 403));

  if (isFriend && isFriend.status === 2)
    return next(new AppError('Invalid action', 403));

  if (isFriend === null) return next(new AppError('no friend invitation', 403));

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

  const requester = await User.findOne({ _id: req.query.requester });

  await new Email(requester, '', {
    status: 'accepted',
    name: req.user.name
  }).sendFriendInformation();

  res.status(200).json({
    status: 'success',
    message: 'You are friends now'
  });
});

// accept friend request e.g route: /api/friends/reject?requester="requester id"
exports.deletefromFriends = catchAsync(async (req, res, next) => {
  if (!isValidID(req.query.requester))
    return next(new AppError('No user found', 404));

  if (req.query.recipient === req.user._id.toString())
    return next(new AppError("You can't accept your invitation", 403));

  const docA = await Friend.findOne({
    requester: req.user._id,
    recipient: req.query.requester
  });

  const docB = await Friend.findOne({
    recipient: req.user._id,
    requester: req.query.requester
  });

  if (docA === null || docB === null) {
    return next(new AppError('You are not friends', 403));
  }
  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $pull: { friends: docA._id } },
    { new: true }
  );

  await User.findOneAndUpdate(
    { _id: req.query.requester },
    { $pull: { friends: docB._id } },
    { new: true }
  );

  await docA.remove();
  await docB.remove();

  const requester = await User.findOne({ _id: req.query.requester });

  const message = 'You are no longer friends';

  await new Email(requester, '', {
    status: 'rejected',
    bame: req.user.name
  }).sendFriendInformation();

  res.status(200).json({
    status: 'success',
    message
  });
});

exports.getUserFriends = catchAsync(async (req, res, next) => {
  const userFriends =
    req.user.role === 'admin' && req.route.path !== '/me/'
      ? await User.findById(req.params.id).populate('friends')
      : await User.findById(req.user.id).populate({
          path: 'friends',
          options: { sort: { createdAt: 'desc' } }
        });

  if (!userFriends.length) {
    return next(new AppError('No friends found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      userFriends: userFriends.Friends
    }
  });
});
