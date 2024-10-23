//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const MovieController = require("./movie.controller");

//manual create movie by admin
route.post("/create", checkAccessWithSecretKey(), MovieController.store);

//manual create series by admin
route.post("/createSeries", checkAccessWithSecretKey(), MovieController.storeSeries);

//get details IMDB id or title wise from TMDB database for admin
route.get("/getStoredetails", checkAccessWithSecretKey(), MovieController.getStoredetails);

//create movie from TMDB database
route.post("/getStore", checkAccessWithSecretKey(), MovieController.getStore);

//update movie or weSeries
route.patch("/update", checkAccessWithSecretKey(), MovieController.update);

//view API
route.patch("/view", checkAccessWithSecretKey(), MovieController.addView);

//get all top10 through view for android
route.get("/Top10", checkAccessWithSecretKey(), MovieController.getAllTop10);

//get all top10 through view for admin panel
route.get("/AllTop10", checkAccessWithSecretKey(), MovieController.getAllCategoryTop10);

//isNewRelease
route.patch("/isNewRelease", checkAccessWithSecretKey(), MovieController.isNewRelease);

//get all isNewRelease
route.get("/isNewRelease", checkAccessWithSecretKey(), MovieController.getAllNewRelease);

//get free or premium movie(all category) wise trailer or episode for android
route.get("/detail", checkAccessWithSecretKey(), MovieController.MovieDetail);

//get movie(all category) wise trailer or episode for backend
route.get("/details", checkAccessWithSecretKey(), MovieController.MovieDetails);

//get year for movie or series
route.get("/getYear", checkAccessWithSecretKey(), MovieController.getYear);

//search Movie Name
route.post("/searchMovieTitle", checkAccessWithSecretKey(), MovieController.search);

//get all movie for android
route.get("/getMovie", checkAccessWithSecretKey(), MovieController.getMovie);

//get all movie for admin panel
route.get("/all", checkAccessWithSecretKey(), MovieController.getAll);

//get all more like this movie
route.get("/allLikeThis", checkAccessWithSecretKey(), MovieController.getAllLikeThis);

//delete movie for admin panel
route.delete("/delete", checkAccessWithSecretKey(), MovieController.destroy);

//get all movie filterWise
route.post("/filterWise", checkAccessWithSecretKey(), MovieController.MovieFilterWise);

//best ComedyMovie for android (home)
route.get("/ComedyMovie", checkAccessWithSecretKey(), MovieController.bestComedyMovie);

//get topRated movie or webseries for android
route.get("/topRated", checkAccessWithSecretKey(), MovieController.getAllTopRated);

//directly upload images from TMDb to your DigitalOcean Spaces
//route.post("/getStore", checkAccessWithSecretKey(), MovieController.getStoreFromTMDBToSpace);

module.exports = route;
