const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  },
  {
    timestamps: true,
  }
);

likeSchema.index({ userId: 1 });
likeSchema.index({ commentId: 1 });

module.exports = mongoose.model("Like", likeSchema);
