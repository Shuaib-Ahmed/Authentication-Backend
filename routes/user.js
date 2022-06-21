const express = require("express");
const Router = express.Router();

const {
  createUser,
  checkUser,
  resetToken,
  updatePassword,
} = require("../controller/user");

Router.route("/signup").post(createUser);
Router.route("/login").post(checkUser);
Router.route("/resetPasswordToken").post(resetToken);
Router.route("/updatePassword/:reset_token").post(updatePassword);

module.exports = Router;
