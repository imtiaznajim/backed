//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const roleController = require("./role.controller");

//create role
route.post("/create", checkAccessWithSecretKey(), roleController.store);

//update role
route.patch("/update", checkAccessWithSecretKey(), roleController.update);

//delete role
route.delete("/delete", checkAccessWithSecretKey(), roleController.destroy);

//get role
route.get("/", checkAccessWithSecretKey(), roleController.get);

//get role movieId wise
route.get("/movieIdWise", checkAccessWithSecretKey(), roleController.getIdWise);

module.exports = route;
