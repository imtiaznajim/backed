//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//Controller
const CountryLiveTVController = require("./countryLiveTV.controller");

//create countryLiveTV from IPTV for admin panel
//route.get("/getStore", checkAccessWithSecretKey(), CountryLiveTVController.getStore);

//get countryLiveTV from IPTV for admin panel
route.get("/", checkAccessWithSecretKey(), CountryLiveTVController.get);

//if isIptvAPI false then get country wise channel and stream ,if isIptvAPI true then get country wise channel and stream added by admin
route.get("/getStoredetail", checkAccessWithSecretKey(), CountryLiveTVController.getStoredetail);

//get country wise channel and stream for admin panel
route.get("/getStoredetails", checkAccessWithSecretKey(), CountryLiveTVController.getStoredetails);

module.exports = route;
