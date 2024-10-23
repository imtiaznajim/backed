//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const downloadController = require("./download.controller");

//create download movie
route.post("/create", checkAccessWithSecretKey(), downloadController.store);

//get userWise downloaded movie
route.get("/userWiseDownload", checkAccessWithSecretKey(), downloadController.userWiseDownload);

//delete the downloaded movie
route.delete("/deleteDownloadMovie", checkAccessWithSecretKey(), downloadController.destroy);

module.exports = route;
