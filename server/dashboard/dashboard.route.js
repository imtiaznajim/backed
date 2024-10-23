//express
const express = require("express");
const route = express.Router();

//controller
const DashboardController = require("./dashboard.controller");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//get Admin Panel Dashboard
route.get("/admin", checkAccessWithSecretKey(), DashboardController.dashboard);

//get date wise analytic for movie and webseries
route.get("/movieAnalytic", checkAccessWithSecretKey(), DashboardController.movieAnalytic);

//get date wise analytic for user and revenue
route.get("/userAnalytic", checkAccessWithSecretKey(), DashboardController.userAnalytic);

module.exports = route;
