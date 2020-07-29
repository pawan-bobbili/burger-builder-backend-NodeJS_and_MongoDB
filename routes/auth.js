const express = require("express");
const { body } = require("express-validator");

const Auth = require("../middleware/Auth");
const authController = require("../controller/auth");

const router = express.Router();

router.post("/signup", Auth.dataValidator, authController.signup);

router.post("/signin", Auth.dataValidator, authController.signin);

module.exports = router;
