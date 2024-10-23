const mongoose = require("mongoose");

const PremiumPlanSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    validity: { type: Number },
    validityType: { type: String },
    dollar: { type: Number },
    tag: { type: String },
    productKey: { type: String },
    planBenefit: { type: Array },
    isAutoRenew: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("PremiumPlan", PremiumPlanSchema);
