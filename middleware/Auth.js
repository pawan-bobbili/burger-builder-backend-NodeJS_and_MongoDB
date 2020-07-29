const { body } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../model/user");

exports.tokenValidator = (req, res, next) => {
    let token = req.get("token");
    if (!token || token === "Bearer ") {
        const error = new Error();
        error.statusCode = 403;
        error.message = ["Token Validation Failed.."];
        throw error;
    }
    token = token.split(" ")[1];
    const userId = req.get("userId");
    let decodedToken;
    try {
        decodedToken = jwt.decode(token, "Karnal@18");
    } catch (err) {
        if (!err.statusCode && !err.status && !err.statuscode) {
            err.statusCode = 500;
        }
        throw err;
    }
    if (!decodedToken || decodedToken.userId.toString() !== userId.toString()) {
        const error = new Error();
        error.statusCode = 403;
        error.message = ["Token Validation Failed.."];
        throw error;
    }
    User.findById(userId)
        .then((userDoc) => {
            if (!userDoc) {
                const error = new Error();
                error.statusCode = 403;
                error.message = ["No Vaild Authorization Provided"];
                throw error;
            }
            req.userId = userId;
            next();
        })
        .catch((err) => next(err));
};

exports.dataValidator = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Not a valid email")
        .normalizeEmail(),
    body("password")
        .isLength({ min: 5 })
        .withMessage("Password should be atleast 5 characters long"),
];
