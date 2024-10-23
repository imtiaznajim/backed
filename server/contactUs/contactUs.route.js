//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const contactController = require("./contactUs.controller");

//create contactUs
route.post("/create", checkAccessWithSecretKey(), contactController.store);

//update contactUs
route.patch("/update", checkAccessWithSecretKey(), contactController.update);

//delete contactUs
route.delete("/delete", checkAccessWithSecretKey(), contactController.destroy);

//get contactUs
route.get("/", checkAccessWithSecretKey(), contactController.get);

module.exports = route;
