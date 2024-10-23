//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const ticketBYUserController = require("./ticketByUser.controller");

//ticket raised by the particular user
route.post("/ticketRaisedByUser", checkAccessWithSecretKey(), ticketBYUserController.ticketRaisedByUser);

//get all raised tickets for admin
route.get("/raisedTickets", checkAccessWithSecretKey(), ticketBYUserController.raisedTickets);

//ticket of particular user solved or not
route.post("/ticketSolve", checkAccessWithSecretKey(), ticketBYUserController.ticketSolve);

module.exports = route;
