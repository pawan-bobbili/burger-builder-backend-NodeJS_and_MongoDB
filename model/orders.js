const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    ingredients: {
        type: Object,
        required: true,
    },
    customerInfo: {
        type: Object,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
});

module.exports = mongoose.model("Order", orderSchema, "Order");
