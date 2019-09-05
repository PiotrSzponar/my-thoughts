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
    photos: [
      {
        type: String
      }
    ],
    tags: {
      type: [
        {
          type: String
        }
      ],
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
    }
  },
  {
    timestamps: true
  }
);

const Post = model('Post', postSchema);

Post.collection.createIndex({ title: 'text', content: 'text', tags: 'text' });

module.exports = Post;
