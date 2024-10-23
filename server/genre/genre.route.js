//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const GenreController = require("./genre.controller");

//create genre from TMDB database
//route.post("/getStore", checkAccessWithSecretKey(), GenreController.getStore);

//create genre
route.post("/create", checkAccessWithSecretKey(), GenreController.store);

//update genre
route.patch("/update", checkAccessWithSecretKey(), GenreController.update);

//delete genre
route.delete("/delete", checkAccessWithSecretKey(), GenreController.destroy);

//get genre
route.get("/", checkAccessWithSecretKey(), GenreController.get);

module.exports = route;
