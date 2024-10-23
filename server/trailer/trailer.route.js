//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const trailerController = require("./trailer.controller");

//store trailer
route.post("/create", checkAccessWithSecretKey(), trailerController.store);

//update trailer
route.patch("/update", checkAccessWithSecretKey(), trailerController.update);

//delete trailer
route.delete("/delete", checkAccessWithSecretKey(), trailerController.destroy);

//get trailer
route.get("/", checkAccessWithSecretKey(), trailerController.get);

//get trailer movieId wise for admin panel
route.get("/movieIdWise", checkAccessWithSecretKey(), trailerController.getIdWise);

module.exports = route;
