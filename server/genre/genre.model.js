const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, default: null },
    uniqueId: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

categorySchema.index({ uniqueId: 1 });

module.exports = mongoose.model("Genre", categorySchema);
