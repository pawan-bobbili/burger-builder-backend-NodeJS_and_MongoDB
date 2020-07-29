const Address = require("../model/address");
const Meal = require("../model/ingredients");
const User = require("../model/user");
const Order = require("../model/orders");

exports.fetchMealIngredients = (req, res, next) => {
    Meal.findOne()
        .then((meal) => {
            if (!meal) {
                const error = new Error();
                error.statusCode = 404;
                error.message = ["No Ingredients were found to fill dish."];
                console.log("Error throwing");
                throw error;
            }
            let ingredients = {};
            for (let ing in meal.ingredients) {
                ingredients = {
                    ...ingredients,
                    [ing]: { qty: 0, price: meal.ingredients[ing] },
                };
            }
            res.status(200).json(ingredients);
        })
        .catch((err) => {
            next(err);
        });
};

exports.orderPlaceHandler = async (req, res, next) => {
    let price = 0;
    try {
        const meal = await Meal.findOne();
        if (!meal) {
            const error = new Error();
            error.statusCode = 404;
            error.message = ["Can't Fetch Ingredients"];
            throw error;
        }
        for (let ing in req.body.ingredients) {
            price += meal.ingredients[ing] * req.body.ingredients[ing];
        }
        let user = await User.findById(req.userId);
        if (!user) {
            const error = new Error();
            error.statusCode = 422;
            error.message = ["No Valid Account Found"];
            throw error;
        }
        const order = new Order({
            ingredients: req.body.ingredients,
            customerInfo: req.body.customerInfo,
            price: price,
            owner: req.userId,
        }).save();
        user.orders.push((await order)._id); // Here await came by auto-completition
        user = await user.save();
        let address;
        if (req.body.type === "ADD") {
            address = new Address({
                name: req.body.customerInfo.name,
                email: req.body.customerInfo.email,
                street: req.body.customerInfo.street,
                zipCode: req.body.customerInfo.zipCode,
                owner: req.userId,
            });
        } else if (req.body.type === "REPLACE") {
            address = await Address.findById(req.body.addressId);
            if (address) {
                address.name = req.body.customerInfo.name;
                address.email = req.body.customerInfo.email;
                address.street = req.body.customerInfo.street;
                address.zipCode = req.body.customerInfo.zipCode;
            }
        }
        if (!address && req.body.type !== "DO NOTHING") {
            const error = new Error();
            error.statusCode = 404;
            error.message = ["Address not Found in Database to Delete/Edit"];
            throw error;
        }
        if (address) {
            address = await address.save();
        }
        if (req.body.type === "ADD") {
            user.addresses.push(address._id);
            user = await user.save();
        }
    } catch (err) {
        next(err);
        return;
    }
    res.status(201).json({ message: "Order Placed Successfully" });
};

exports.fetchOrders = async (req, res, next) => {
    const perPage = 3;
    User.findById(req.userId)
        .then(async (userDoc) => {
            if (!userDoc) {
                const error = new Error();
                error.statusCode = 403;
                error.message = ["No Valid Account detected.."];
                throw error;
            }
            const orders = [];
            let order;
            const page = req.query.page;
            const totalOrders = userDoc.orders.length;
            let start = (page - 1) * perPage,
                end = Math.min(totalOrders - 1, start + perPage - 1);
            while (start <= end) {
                order = await Order.findById(userDoc.orders[start]);
                orders.push(order);
                start++;
            }
            res.status(200).json({
                orders: orders,
                perPage: 1,
                totalOrders: totalOrders,
            });
        })
        .catch((err) => next(err));
};

exports.getShipmentDetails = (req, res, next) => {
    User.findById(req.userId)
        .then((userDoc) => {
            if (!userDoc) {
                const error = new Error();
                error.statusCode = 403;
                error.message = ["No Valid Account Found"];
                throw error;
            }
            return userDoc.populate("addresses").execPopulate();
        })
        .then((userDoc) => {
            const addresses = [];
            for (let address of userDoc.addresses) {
                addresses.push({
                    name: address.name,
                    email: address.email,
                    street: address.street,
                    zipCode: address.zipCode,
                    id: address._id.toString(),
                });
            }
            res.status(201).json({ addresses });
        })
        .catch((err) => next(err));
};

exports.editAddress = (req, res, next) => {
    User.findById(req.userId)
        .then((user) => {
            if (!user) {
                const error = new Error();
                error.statusCode = 403;
                error.message = ["No Valid Account Found"];
                throw error;
            }
            return Address.findById(req.body.id);
        })
        .then((address) => {
            if (!address) {
                const error = new Error();
                error.statusCode = 404;
                error.message = ["No Address Found to edit"];
                throw error;
            }
            if (address.owner.toString() !== req.userId) {
                const error = new Error();
                error.statusCode = 422;
                error.message = ["No Valid Authorization Found"];
                throw error;
            }
            for (let key in req.body.newAddress) {
                address[key] = req.body.newAddress[key];
            }
            return address.save();
        })
        .then((result) => {
            res.status(200).json({ message: "Address Edited Succesfully" });
        })
        .catch((err) => next(err));
};

exports.deleteAddress = (req, res, next) => {
    const id = req.params.id;
    let loadedUser, loadedAddress;
    User.findById(req.userId)
        .then((user) => {
            if (!user) {
                const error = new Error();
                error.statusCode = 403;
                error.message = ["No Valid Account Found"];
                throw error;
            }
            loadedUser = user;
            return Address.findById(id);
        })
        .then((address) => {
            if (!address) {
                const error = new Error();
                error.statusCode = 404;
                error.message = ["No Address Found to delete"];
                throw error;
            }
            if (address.owner.toString() !== req.userId) {
                const error = new Error();
                error.statusCode = 422;
                error.message = ["No Valid Authorization Found"];
                throw error;
            }
            loadedAddress = address;
            let addresses = [];
            for (let address of loadedUser.addresses) {
                if (address.toString() !== id) {
                    addresses.push(address);
                }
            }
            loadedUser.addresses = addresses;
            return loadedUser.save();
        })
        .then((result) => {
            return loadedAddress.remove();
        })
        .then((result) => {
            res.status(201).json({ message: "Address Deleted Succesfully" });
        })
        .catch((err) => next(err));
};
