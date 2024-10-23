//import mongoose
const mongoose = require("mongoose");

//import cors
const cors = require("cors");

//import express
const express = require("express");
const app = express();

//import path
const path = require("path");

//fs
const fs = require("fs");

//dotenv
require("dotenv").config({ path: ".env" });

app.use(cors());
app.use(express.json({ extended: false, limit: "3gb" }));
app.use(express.urlencoded({ extended: false, limit: "3gb" }));
app.use(express.static(path.join(__dirname, "public")));

//import model
const Setting = require("./server/setting/setting.model");

//settingJson
const settingJson = require("./setting");

//Declare global variable
global.settingJSON = {};

//handle global.settingJSON when pm2 restart
async function initializeSettings() {
  try {
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (setting) {
      console.log("In setting initialize Settings");
      global.settingJSON = setting;
    } else {
      global.settingJSON = settingJson;
    }
  } catch (error) {
    console.error("Failed to initialize settings:", error);
  }
}

module.exports = initializeSettings();

//Declare the function as a global variable to update the setting.js file
global.updateSettingFile = (settingData) => {
  const settingJSON = JSON.stringify(settingData, null, 2);
  fs.writeFileSync("setting.js", `module.exports = ${settingJSON};`, "utf8");

  global.settingJSON = settingData; // Update global variable
  console.log("Settings file updated.");
};

//route.js
const Route = require("./route");
app.use("/", Route);

//Public File
app.get("/*", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
});

//mongoose connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));

db.once("open", () => {
  console.log("MONGO: successfully connected to db");
});

mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Set port and listen the request
app.listen(process.env.PORT, () => {
  console.log("Hello World!! listening on " + process.env.PORT);
});
