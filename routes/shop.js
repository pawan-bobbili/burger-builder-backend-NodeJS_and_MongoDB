const express = require("express");

const Auth = require("../middleware/Auth");
const shopController = require("../controller/shop");

const router = express.Router();

router.get("/ingredients", shopController.fetchMealIngredients);

router.get("/orders", Auth.tokenValidator, shopController.fetchOrders);

router.post("/order", Auth.tokenValidator, shopController.orderPlaceHandler);

router.get(
    "/contactdata",
    Auth.tokenValidator,
    shopController.getShipmentDetails
);

router.post("/editAddress", Auth.tokenValidator, shopController.editAddress);

router.delete(
    "/deleteAddress/:id",
    Auth.tokenValidator,
    shopController.deleteAddress
);

module.exports = router;
