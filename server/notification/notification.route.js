//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const NotificationController = require("./notification.controller");

//handle user notification
route.post("/userNotification", checkAccessWithSecretKey(), NotificationController.handleNotification);

//get notification list
route.get("/list", checkAccessWithSecretKey(), NotificationController.getNotificationList);

//send notification by admin
route.post("/send", checkAccessWithSecretKey(), NotificationController.sendNotifications);

module.exports = route;
