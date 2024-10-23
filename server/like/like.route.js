//express
const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const LikeController = require("./like.controller");

//create LikeAndDislike for comment
route.post("/create", checkAccessWithSecretKey(), LikeController.likeAndDislike);

//get comment likes
route.get("/commentLike", checkAccessWithSecretKey(), LikeController.index);

module.exports = route;
