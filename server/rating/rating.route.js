//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const ratingController = require("./rating.controller");

//create rating
route.post("/addRating", checkAccessWithSecretKey(), ratingController.addRating);

//get allMovie avgRating
route.get("/", checkAccessWithSecretKey(), ratingController.getRating);

module.exports = route;
