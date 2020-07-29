const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");

const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const shopRoutes = require("./routes/shop");
const keys = require("./apikeys");

const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE, *"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, *"
    );
    next();
});

app.use(bodyParser.json());

app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/shop", shopRoutes);

app.use((err, req, res, next) => {
    console.log(err);
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    if (!err.message) {
        err.message = ["Server failed to response.."];
    }
    if (!err.message.length) {
        let msg = err.message;
        err.message = [msg];
    }
    res.status(err.statusCode).json(err);
});

mongoose
    .connect(keys.mongoURI)
    .then((result) => {
        app.listen(8080);
        console.log("Backend Established");
    })
    .catch((err) => {
        console.log(err);
    });
