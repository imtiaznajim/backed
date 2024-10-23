//express
const express = require("express");
const route = express.Router();

//admin middleware
const AdminMiddleware = require("../middleware/admin.middleware");

//controller
const AdminController = require("./admin.controller");

//create admin
route.post("/create", AdminController.store);

//admin login
route.post("/login", AdminController.login);

//get admin profile
route.get("/profile", AdminMiddleware, AdminController.getProfile);

//update admin profile email and name
route.patch("/", AdminMiddleware, AdminController.update);

//update admin Profile Image
route.patch("/updateImage", AdminMiddleware, AdminController.updateImage);

//update admin password
route.put("/updatePassword", AdminMiddleware, AdminController.updatePassword);

//forgrt admin password (send email for forgot the password)
route.post("/forgetPassword", AdminController.forgotPassword);

//set admin password
route.post("/setPassword", AdminController.setPassword);

module.exports = route;
