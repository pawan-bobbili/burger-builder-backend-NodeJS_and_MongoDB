const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    email: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    street: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    zipCode: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

module.exports = mongoose.model("Address", addressSchema, "Address");
