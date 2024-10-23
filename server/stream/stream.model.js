const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema(
  {
    channelId: { type: String, default: null },
    streamURL: { type: String },
    channelName: { type: String },
    channelLogo: { type: String },
    countryCode: { type: String },
    country: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Stream", streamSchema);
