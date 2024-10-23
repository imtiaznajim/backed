const mongoose = require("mongoose");

const favoriteSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

favoriteSchema.index({ userId: 1 });
favoriteSchema.index({ movieId: 1 });

module.exports = mongoose.model("Favorite", favoriteSchema);
