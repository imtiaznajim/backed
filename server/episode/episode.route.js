//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const EpisodeController = require("./episode.controller");

//create episode
route.post("/create", checkAccessWithSecretKey(), EpisodeController.store);

//update episode
route.patch("/update", checkAccessWithSecretKey(), EpisodeController.update);

//get all episode
route.get("/", checkAccessWithSecretKey(), EpisodeController.get);

//delete episode
route.delete("/delete", checkAccessWithSecretKey(), EpisodeController.destroy);

//get season wise episode for admin panel
route.get("/seasonWiseEpisode", checkAccessWithSecretKey(), EpisodeController.seasonWiseEpisode);

//get season wise episode for android
route.get("/seasonWiseEpisodeAndroid", checkAccessWithSecretKey(), EpisodeController.seasonWiseEpisodeAndroid);

//get movie only if category web series
route.get("/series", checkAccessWithSecretKey(), EpisodeController.getSeries);

module.exports = route;
