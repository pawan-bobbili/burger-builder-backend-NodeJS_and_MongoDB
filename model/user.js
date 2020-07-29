const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    password: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    name: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    addresses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
        },
    ],
});

module.exports = mongoose.model("User", userSchema, "User");
