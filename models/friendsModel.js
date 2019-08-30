const { Schema, model } = require('mongoose');

const friendsSchema = new Schema(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'User', select: false },
    recipient: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    status: {
      type: Number,
      enums: [
        0, // add friend
        1, // requested
        2, // pending
        3 // friends
      ],
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = model('Friend', friendsSchema);
