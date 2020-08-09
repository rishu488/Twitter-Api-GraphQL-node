import mongoose, { Schema } from 'mongoose';

const setTags = tags => tags.map(t => t.toLowerCase());


const TweetSchema = new Schema(
  {
    body: { type: String, default: "", trim: true, maxlength: 150 },
    user: { type: Schema.ObjectId, ref: "User" },
    comments: [
      {
        body: { type: String, default: "", maxlength: 150 },
        user: { type: Schema.ObjectId, ref: "User" },
        commenterName: { type: String, default: "" },
        commenterPicture: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    tags: { type: [String], set: setTags },
    favorites: [{ type: Schema.ObjectId, ref: "User" }],
    favoriters: [{ type: Schema.ObjectId, ref: "User" }], 
    favoritesCount: Number,
    createdAt: { type: Date, default: Date.now }
  },
  { usePushEach: true }
);


TweetSchema.pre("save", function(next) {
  if (this.favorites) {
    this.favoritesCount = this.favorites.length;
  }
  if (this.favorites) {
    this.favoriters = this.favorites;
  }
  next();
});


TweetSchema.path("body").validate(
  body => body.length > 0,
  "Tweet body cannot be blank"
);

TweetSchema.virtual("_favorites").set(function(user) {
  if (this.favorites.indexOf(user._id) === -1) {
    this.favorites.push(user._id);
  } else {
    this.favorites.splice(this.favorites.indexOf(user._id), 1);
  }
});
TweetSchema.methods = {
  uploadAndSave: function(images, callback) {
    
    const self = this;
    if (!images || !images.length) {
      return this.save(callback);
    }
    imager.upload(
      images,
      (err, cdnUri, files) => {
        if (err) {
          return callback(err);
        }
        if (files.length) {
          self.image = { cdnUri: cdnUri, files: files };
        }
        self.save(callback);
      },
      "article"
    );
  },
  addComment: function(user, comment, cb) {
    if (user.name) {
      this.comments.push({
        body: comment.body,
        user: user._id,
        commenterName: user.name,
        commenterPicture: user.github.avatar_url
      });
      this.save(cb);
    } else {
      this.comments.push({
        body: comment.body,
        user: user._id,
        commenterName: user.username,
        commenterPicture: user.github.avatar_url
      });

      this.save(cb);
    }
  },

  removeComment: function(commentId, cb) {
    let index = utils.indexof(this.comments, { id: commentId });
    if (~index) {
      this.comments.splice(index, 1);
    } else {
      return cb("not found");
    }
    this.save(cb);
  }
}

TweetSchema.statics = {
  incFavoriteCount(tweetId) {
    return this.findByIdAndUpdate(tweetId, { $inc: { favoriteCount: 1 } }, { new: true });
  },
  decFavoriteCount(tweetId) {
    return this.findByIdAndUpdate(tweetId, { $inc: { favoriteCount: -1 } }, { new: true });
  }
}

export default mongoose.model('Tweet', TweetSchema);
