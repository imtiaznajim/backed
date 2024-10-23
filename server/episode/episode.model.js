const mongoose = require("mongoose");

const EpisodeSchema = new mongoose.Schema(
  {
    name: String,
    episodeNumber: Number,
    image: String,
    videoType: { type: Number, default: 0 }, //0:YoutubeUrl 1:m3u8Url 2:MP4 3:MKV 4:WEBM 5:Embed 6:File 7:MOV
    videoUrl: { type: String, default: "" },
    seasonNumber: Number,
    TmdbMovieId: String,
    runtime: { type: String, default: null },

    updateType: { type: Number, default: 0 }, //0:tmdb 1:manual (handle to convert the image)
    convertUpdateType: {
      image: { type: Number, default: 0 },
      videoUrl: { type: Number, default: 0 },
    },

    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
    season: { type: mongoose.Schema.Types.ObjectId, ref: "Season" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

EpisodeSchema.index({ movie: 1 });
EpisodeSchema.index({ season: 1 });

module.exports = mongoose.model("Episode", EpisodeSchema);
