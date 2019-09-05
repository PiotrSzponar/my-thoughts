const { ObjectID } = require('mongodb');
const User = require('../models/userModel');
const Friend = require('../models/friendsModel');

const Email = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

const isValidID = id => ObjectID.isValid(id);

// send friend request e.g route: /api/friends/request/<recipient id>
exports.requestToFriends = catchAsync(async (req, res, next) => {
  // check if provided param is ObjectID
  if (!isValidID(req.params.recipient))
    return next(new AppError('No user found', 404));

  // check if User is already your friend
  const isFriend = await Friend.findOne({
    requester: req.user._id,
    recipient: req.params.recipient
  });

  if (req.params.recipient === req.user._id.toString())
    return next(new AppError("You can't add yourself to friends", 403));
  // check status
  if (isFriend && isFriend.status === 3)
    return next(new AppError('This User is your friend', 403));

  if (isFriend && isFriend.status === 2)
    return next(new AppError('This User has invited you to friends', 403));

  if (isFriend && isFriend.status === 1)
    return next(new AppError('You already sent an invitation', 403));

  const recipient = await User.findOne({ _id: req.params.recipient }).select(
    '+isVerified'
  );

  if (!recipient.isVerified)
    return next(new AppError('User you want to invite is not verified', 400));

  const docA = await Friend.findOneAndUpdate(
    { requester: req.user._id, recipient: req.params.recipient },
    { $set: { status: 1, name: recipient.name } },
    { upsert: true, new: true }
  );

  const docB = await Friend.findOneAndUpdate(
    { recipient: req.user._id, requester: req.params.recipient },
    { $set: { status: 2, name: req.user.name } },
    { upsert: true, new: true }
  );

  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $push: { friends: docA._id } }
  );

  await User.findOneAndUpdate(
    { _id: req.params.recipient },
    { $push: { friends: docB._id } }
  );

  const acceptURL = `${req.protocol}://${req.get('host')}/api/friends/accept/${
    req.user._id
  }`;

  const rejectURL = `${req.protocol}://${req.get('host')}/api/friends/reject/${
    req.user._id
  }`;

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

// accept friend request e.g route: /api/friends/accept/<requester id>
exports.acceptToFriends = catchAsync(async (req, res, next) => {
  if (!isValidID(req.params.requester))
    return next(new AppError('No user found', 404));

  if (req.params.recipient === req.user._id.toString())
    return next(new AppError("You can't accept your invitation", 403));

  const isFriend = await Friend.findOne({
    requester: req.params.requester,
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
    { requester: req.params.requester, recipient: req.user._id },
    { $set: { status: 3 } },
    { new: true }
  );

  await Friend.findOneAndUpdate(
    { recipient: req.params.requester, requester: req.user._id },
    { $set: { status: 3 } },
    { new: true }
  );

  const requester = await User.findOne({ _id: req.params.requester });

  await new Email(requester, '', {
    status: 'accepted',
    name: req.user.name
  }).sendFriendInformation();

  res.status(200).json({
    status: 'success',
    message: 'You are friends now'
  });
});

// accept friend request e.g route: /api/friends/reject/<requester id>
exports.deletefromFriends = catchAsync(async (req, res, next) => {
  if (!isValidID(req.params.requester))
    return next(new AppError('No user found', 404));

  if (req.params.recipient === req.user._id.toString())
    return next(new AppError("You can't accept your invitation", 403));

  const docA = await Friend.findOne({
    requester: req.user._id,
    recipient: req.params.requester
  });

  const docB = await Friend.findOne({
    recipient: req.user._id,
    requester: req.params.requester
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
    { _id: req.params.requester },
    { $pull: { friends: docB._id } },
    { new: true }
  );

  await docA.remove();
  await docB.remove();

  const requester = await User.findOne({ _id: req.params.requester });

  const message = 'You are no longer friends';

  await new Email(requester, '', {
    status: 'rejected',
    name: req.user.name
  }).sendFriendInformation();

  res.status(200).json({
    status: 'success',
    message
  });
});

// get user friends
exports.getUserFriends = catchAsync(async (req, res, next) => {
  if (req.route.path === '/me') {
    const features = new APIFeatures(
      Friend.find({ requester: req.user.id })
        .populate({
          path: 'recipient',
          select: 'id name'
        })
        .select('status updatedAt')
        .sort({ status: 1, updatedAt: -1 }),
      req.query
    ).paginate();

    const userFriends = await features.query;

    if (!userFriends) {
      return next(new AppError('No friends found', 404));
    }

    const friendsCount = userFriends.filter(el => el.status === 3).length;

    res.status(200).json({
      status: 'success',
      data: {
        id: req.user.id,
        name: req.user.name,
        friendsCount,
        friends: userFriends
      }
    });
  } else {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'friends',
        select: 'status',
        match: { status: 3 }
      })
      .select('name');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const features = new APIFeatures(
      Friend.find({ requester: req.params.id, status: 3 })
        .populate({
          path: 'recipient',
          select: 'id name'
        })
        .select('updatedAt')
        .sort({ updatedAt: -1 }),
      req.query
    ).paginate();

    const userFriends = await features.query;

    if (!userFriends) {
      return next(new AppError('No friends found', 404));
    }

    const friendsCount = user.friends.length;

    res.status(200).json({
      status: 'success',
      data: {
        id: req.params.id,
        name: user.name,
        friendsCount,
        friends: userFriends
      }
    });
  }
});
