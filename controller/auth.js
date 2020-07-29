const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const User = require("../model/user");
const keys = require("../apikeys");

exports.signup = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error();
        error.statusCode = 422;
        error.message = [];
        let errorArray = errors.array();
        for (let err of errorArray) {
            error.message.push(err.msg);
        }
        throw error;
    }
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (user) {
                const error = new Error();
                error.statusCode = 422;
                error.message = ["Email already exits"];
                throw error;
            }
            return bcryptjs.hash(req.body.password, 18);
        })
        .then((hashPwd) => {
            const user = new User({
                email: req.body.email,
                password: hashPwd,
                name: "Default for now",
            });
            return user.save();
        })
        .then((userDoc) => {
            res.status(201).json({ message: "User Created Successfully" });
        })
        .catch((err) => next(err));
};

exports.signin = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error();
        error.statusCode = 422;
        error.message = [];
        let errorArray = errors.array();
        for (let err of errorArray) {
            error.message.push(err.msg);
        }
        throw error;
    }
    let loadeduser;
    User.findOne({ email: req.body.email })
        .then((userDoc) => {
            if (!userDoc) {
                const error = new Error();
                error.statusCode = 403;
                error.message = ["No Email exists"];
                throw error;
            }
            loadeduser = userDoc;
            return bcryptjs.compare(req.body.password, userDoc.password);
        })
        .then((isEqual) => {
            if (!isEqual) {
                const error = new Error();
                error.statusCode = 422;
                error.message = ["Invalid Password"];
                throw error;
            }
            const token = jwt.sign({ userId: loadeduser._id }, keys.jwtSecret, {
                expiresIn: "1h",
            });
            res.status(200).json({
                idToken: token,
                localId: loadeduser._id.toString(),
                expiresIn: 3600,
            });
        })
        .catch((err) => next(err));
};
