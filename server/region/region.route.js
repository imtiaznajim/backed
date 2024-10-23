//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//Controller
const RegionController = require("./region.controller");

//create region from TMDB database
//route.post("/getStore", checkAccessWithSecretKey(), RegionController.getStore);

//create region
route.post("/create", checkAccessWithSecretKey(), RegionController.store);

//update region
route.patch("/update", checkAccessWithSecretKey(), RegionController.update);

//get region
route.get("/", checkAccessWithSecretKey(), RegionController.get);

//delete region
route.delete("/delete", checkAccessWithSecretKey(), RegionController.destroy);

module.exports = route;
