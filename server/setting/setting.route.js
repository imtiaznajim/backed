//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const settingController = require("./setting.controller");

//create Setting
//route.post("/create", checkAccessWithSecretKey(), settingController.store);

//update Setting
route.patch("/update", checkAccessWithSecretKey(), settingController.update);

//handle setting switch
route.patch("/", checkAccessWithSecretKey(), settingController.handleSwitch);

//get setting data
route.get("/", checkAccessWithSecretKey(), settingController.index);

module.exports = route;
