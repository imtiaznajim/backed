//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const AdvertisementController = require("./advertisement.controller");

//create advertisement
route.post("/create", checkAccessWithSecretKey(), AdvertisementController.store);

//update advertisement
route.patch("/update", checkAccessWithSecretKey(), AdvertisementController.update);

//get advertisement
route.get("/", checkAccessWithSecretKey(), AdvertisementController.getAdd);

//googleAdd handle on or off
route.patch("/googleAdd", checkAccessWithSecretKey(), AdvertisementController.googleAdd);

//appAddOnOff handle
//route.patch("/appAddOnOff", checkAccessWithSecretKey(), AdvertisementController.appAddOnOff);

//appAddOn handle
//route.patch("/appAddOn", checkAccessWithSecretKey(), AdvertisementController.appAddOn);

module.exports = route;
