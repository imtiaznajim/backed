//Mongoose
const mongoose = require("mongoose");

//Setting Schema
const settingSchema = new mongoose.Schema(
  {
    googlePlayEmail: { type: String, default: "GOOGLE PLAY EMAIL" },
    googlePlayKey: { type: String, default: "GOOGLE PLAY KEY" },
    stripePublishableKey: { type: String, default: "STRIPE PUBLISHABLE KEY" },
    stripeSecretKey: { type: String, default: "STRIPE SECRET KEY" },
    razorPayId: { type: String, default: "RAZOR PAY ID" },
    razorSecretKey: { type: String, default: "RAZOR SECRET KEY" },
    flutterWaveId: { type: String, default: "FLUTTER WAVE ID" },

    privacyPolicyLink: { type: String, default: "PRIVACY POLICY LINK" },
    privacyPolicyText: { type: String, default: "PRIVACY POLICY TEXT" },

    googlePlaySwitch: { type: Boolean, default: false },
    stripeSwitch: { type: Boolean, default: false },
    razorPaySwitch: { type: Boolean, default: false },
    flutterWaveSwitch: { type: Boolean, default: false },

    isAppActive: { type: Boolean, default: true },

    //for iptv API data handle
    isIptvAPI: { type: Boolean, default: true },

    paymentGateway: { type: Array, default: [] },
    currency: { type: String, default: "$" },
    privateKey: { type: Object, default: {} }, //firebase.json handle notification
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Setting", settingSchema);
