const { ObjectID } = require('mongodb');
const User = require('../models/userModel');
const Friend = require('../models/friendsModel');

const Email = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

const isValidID = id => ObjectID.isValid(id);

// send friend request e.g route: /api/friends/request-friend?recipient="recpipient id"
exports.requestToFriends = catchAsync(async (req, res, next) => {
  // check if provided query is ObjectID
  if (!isValidID(req.query.recipient))
    return next(new AppError('No user found', 404));

  // check if User is already your friend
  const isFriend = await Friend.findOne({
    requester: req.user._id,
    recipient: req.query.recipient
  });

  // check status
  if (isFriend && isFriend.status === 3)
    return next(new AppError('This User is your friend', 401));

  if (isFriend && isFriend.status === 2)
    return next(new AppError('This User has invited you to friends', 401));

  if (isFriend && isFriend.status === 1)
    return next(new AppError('You already send an invitation', 401));

  const recipient = await User.findOne({ _id: req.query.recipient }).select(
    '+isVerified'
  );

  if (!recipient.isVerified)
    return next(new AppError('User you want to invite is not verified', 400));

  if (recipient.Friends.length > 50)
    return next(
      new AppError("Can't inivite new friend, friends limit is 50", 404)
    );

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
    { $push: { Friends: docA._id } }
  );

  await User.findOneAndUpdate(
    { _id: req.query.recipient },
    { $push: { Friends: docB._id } }
  );

  const acceptURL = `${req.protocol}://${req.get(
    'host'
  )}/api/friends/accept-friend?requester=${req.user._id}`;

  const rejectURL = `${req.protocol}://${req.get(
    'host'
  )}/api/friends/reject-friend?requester=${req.user._id}`;

  await new Email(req.user, '', {
    state: 'pending',
    name: recipient.name,
    accept: acceptURL,
    reject: rejectURL
  }).sendFriendInvitation();

  res.status(200).json({
    status: 'success',
    message: 'Your request has been sent'
  });
});

// accept friend request e.g route: /api/friends/accept-friend?requester="requester id"
exports.acceptToFriends = catchAsync(async (req, res, next) => {
  if (!isValidID(req.query.requester))
    return next(new AppError('No user found', 404));

  //add when user deleted, remove also friends relations
  const isFriend = await Friend.find({
    requester: req.query.requester,
    recipient: req.user._id,
    status: 3
  });

  // check status
  if (isFriend.length)
    return next(new AppError('This User is already your friend', 401));

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

  const requester = await Friend.findOne({ _id: req.query.requester });

  await new Email(requester, '', {
    status: 'accepted',
    name: requester.name
  }).sendFriendInformation();

  res.status(200).json({
    status: 'success',
    message: 'You are friends now'
  });
});

exports.deletefromFriends = catchAsync(async (req, res, next) => {
  if (!isValidID(req.query.requester))
    return next(new AppError('No user found', 404));

  const docA = await Friend.findOneAndRemove({
    requester: req.user._id,
    recipient: req.query.requester
  });

  const docB = await Friend.findOneAndRemove({
    recipient: req.user._id,
    requester: req.query.requester
  });

  // if friends not found
  if (docA === null || docB === null)
    return next(new AppError('You are not friends', 404));

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

  const requester = await Friend.findOne({ _id: req.query.requester });

  let message = 'You are not friends from now';
  // only sent information when user rejects request
  if (req.route.path === '/reject-friend') {
    message = 'invite successfuly rejected';
    await new Email(requester, '', {
      status: 'rejected',
      name: requester.name
    }).sendFriendInformation();
  }
  res.status(200).json({
    status: 'success',
    message
  });
});
