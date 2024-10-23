const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: { type: String },
    image: { type: String },
    thumbnail: { type: String },
    link: { type: String }, //link or videoURL
    date: String,
    year: { type: String },
    description: { type: String },
    type: { type: String, default: "Premium" }, //Free or Premium
    isNewRelease: { type: Boolean, default: false },

    region: { type: mongoose.Schema.Types.ObjectId, ref: "Region" },
    genre: [{ type: mongoose.Schema.Types.ObjectId, ref: "Genre" }],
    rating: { type: mongoose.Schema.Types.ObjectId, ref: "Rating" },

    view: { type: Number, default: 0 },
    comment: { type: Number, default: 0 },
    runtime: { type: String, default: null },

    updateType: { type: Number, default: 0 }, //0:tmdb 1:manual (handle to convert the image)

    convertUpdateType: {
      image: { type: Number, default: 0 },
      thumbnail: { type: Number, default: 0 },
      link: { type: Number, default: 0 },
    },

    //for import the data from TMDB
    TmdbMovieId: { type: String, default: null },
    IMDBid: { type: String, default: null },
    media_type: { type: String }, //movie, tv
    videoType: { type: Number }, //0:YoutubeUrl 1:m3u8Url 2:MOV 3:MP4 4:MKV 5:WEBM 6:Embed 7:File
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

movieSchema.index({ region: 1 });
movieSchema.index({ genre: 1 });
movieSchema.index({ rating: 1 });
movieSchema.index({ media_type: 1 });

module.exports = mongoose.model("Movie", movieSchema);
