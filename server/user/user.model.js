const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: "",
    },
    fullName: { type: String, default: "MovaUser" },
    nickName: { type: String, default: "Mova123" },
    email: { type: String, default: "MovaUser123@gmail.com" },
    gender: { type: String, default: "Male" },
    country: { type: String, default: "India" },
    password: { type: String, default: null },
    uniqueId: { type: String, default: null },
    loginType: { type: Number, enum: [0, 1, 2] }, //0.google 1.Apple 2.quick 3.password
    interest: { type: Array, default: [] },
    referralCode: { type: String },
    fcmToken: { type: String, default: null },
    identity: { type: String },
    date: { type: String },

    notification: {
      GeneralNotification: { type: Boolean, default: true },
      NewReleasesMovie: { type: Boolean, default: true },
      AppUpdate: { type: Boolean, default: true },
      Subscription: { type: Boolean, default: true },
    },

    isBlock: { type: Boolean, default: false },
    isPremiumPlan: { type: Boolean, default: false },
    plan: {
      planStartDate: { type: String, default: null }, // Premium plan start date
      planEndDate: { type: String, default: null }, // Premium plan end date
      premiumPlanId: { type: mongoose.Schema.Types.ObjectId, ref: "PremiumPlan", default: null },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);
