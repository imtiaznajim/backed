//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const premiumPlanController = require("./premiumPlan.controller");

//get premiumPlanHistory of particular user (user)
route.get("/planHistoryOfUser", checkAccessWithSecretKey(), premiumPlanController.planHistoryOfUser);

//create PremiumPlan
route.post("/create", checkAccessWithSecretKey(), premiumPlanController.store);

//update PremiumPlan
route.patch("/update", checkAccessWithSecretKey(), premiumPlanController.update);

//delete PremiumPlan
route.delete("/delete", checkAccessWithSecretKey(), premiumPlanController.destroy);

//get PremiumPlan
route.get("/", checkAccessWithSecretKey(), premiumPlanController.index);

//create PremiumPlanHistory
route.post("/createHistory", checkAccessWithSecretKey(), premiumPlanController.createHistory);

//get premiumPlanHistory of user (admin)
route.get("/history", checkAccessWithSecretKey(), premiumPlanController.premiumPlanHistory);

module.exports = route;
