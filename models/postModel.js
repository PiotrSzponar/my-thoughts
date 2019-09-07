const { Schema, model } = require('mongoose');

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required!']
    },
    content: {
      type: String,
      required: [true, 'Post should contain some text!']
    },
    photo: {
      type: String
    },
    tags: {
      type: [String],
      validate: {
        validator: function(el) {
          return el.length <= 10;
        },
        message: 'Tags exceeds the limit of 10!'
      }
    },
    privacy: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false
    }
  },
  {
    timestamps: true
  }
);

// Return only existing posts when using 'find' methods
postSchema.pre(/^find/, function(next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Post = model('Post', postSchema);

Post.collection.createIndex({ title: 'text', content: 'text', tags: 'text' });

module.exports = Post;
