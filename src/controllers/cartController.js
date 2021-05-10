const CartModel = require("../models/cartModel");
const UserModel = require("../models/userModel");
const { body, validationResult, param } = require("express-validator");
const apiResponse = require("../helpers/response");
const generateHashId = require("../helpers/generateId");
const ProductModel = require("../models/productModel");
const { PRODUCT_COLLECTION_NAME } = require("../constant/common");
const OrdersModel = require("../models/ordersModel");

function CartData(data) {
    this.cartId = data.cartId;
    this.userId = data.userId;
    this.items = data.items.map(x => { return { productId: x.productId, quantity: x.quantity } });
}


/**
 * Add Cart for User.
 * @param   {string}    userId
 * 
 * @returns {Object}
 */
exports.addCart = [
    param("id", "Please provide userId.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return UserModel.findOne({ userId: value }).then(user => {
            if (!user) {
                return Promise.reject("User not exist.");
            }
        });
    }),
    (req, res) => {

        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }
            const cartId = generateHashId(Date.now().toString());
            const cart = new CartModel({
                cartId,
                userId: req.params.id
            })
            cart.save().then(_res => {
                return UserModel.updateOne({ userId: req.params.id }, { $addToSet: { carts: cartId } })
            }).then(_res => {
                let cartData = new CartData(cart)
                return apiResponse.successResponseWithData(res, "Cart created successfully", cartData);
            }).catch(err => {
                return apiResponse.errorResponse(res, err.message);
            });
        } catch (err) {
            return apiResponse.errorResponse(res, err.message);
        }
    }
];


/**
 * Get All Cart for User.
 * @param   {string}    userId
 * 
 * @returns {Object}
 */
exports.getAllCartByUserId = [
    param("id", "Please provide userId.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return UserModel.findOne({ userId: value }).then(user => {
            if (!user) {
                return Promise.reject("User not exist.");
            }
        });
    }),
    function (req, res) {
        let response = {
            ids: [],
            count: 0
        }
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }

            CartModel.find({}, { _id: 1, cartId: 1 }).then((categories) => {
                if (categories.length > 0) {
                    categories.forEach(ele => {
                        response.ids.push(ele.cartId);
                    })
                    response.count = response.ids.length;
                }
                return apiResponse.successResponseWithData(res, "Operation success", response);
            });
        } catch (err) {
            return apiResponse.errorResponse(res, err.message);
        }
    }
];


/**
 * Add Product.
 * 
 * @param {string}      cartId 
 * @param {string}      productId 
 * @param {number}      quantity
 * 
 * @returns {string}
 */
exports.addProductToCart = [
    body("quantity", "Quantity must not be empty.").isLength({ min: 1 }).isNumeric().withMessage("Please provide valid quantity.").toInt(),
    body("productId", "Please provide productId.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return ProductModel.findOne({ productId: value }).then(product => {
            if (!product) {
                return Promise.reject("Please provide valid productId.");
            }
        });
    }),
    body("cartId", "Please provide cartId.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return CartModel.findOne({ cartId: value }).then(cart => {
            if (!cart) {
                return Promise.reject("Please provide valid cartId.");
            }
        });
    }),
    (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }
            else {

                CartModel.updateOne({ cartId: req.body.cartId }, { $addToSet: { items: { quantity: req.body.quantity, productId: req.body.productId } } }).then(response => {
                    if (response && response.nModified === 0 && response.ok == 0) {
                        throw new Error("Unable to add product to cart");
                    }
                    return apiResponse.successResponse(res, "Product added to cart successfully");
                }).catch(err => {
                    return apiResponse.errorResponse(res, err.message);
                });
            }
        } catch (err) {
            return apiResponse.errorResponse(res, err.message);
        }
    }
];


/**
 * Remove Product from cart.
 * 
 * @param {string}      cartId 
 * @param {string}      productId 
 * 
 * @returns {string}
 */
exports.removeProductFromCart = [
    body("productId", "Please provide productId.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return ProductModel.findOne({ productId: value }).then(product => {
            if (!product) {
                return Promise.reject("Please provide valid productId.");
            }
        });
    }),
    body("cartId", "Please provide cartId.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return CartModel.findOne({ cartId: value }).then(cart => {
            if (!cart) {
                return Promise.reject("Please provide valid cartId.");
            }
        });
    }),
    (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }
            else {

                CartModel.updateOne({ cartId: req.body.cartId }, { $pull: { items: { productId: req.body.productId } } }).then(response => {
                    if (response && response.nModified === 0 && response.ok === 0) {
                        throw new Error("Unable to remove product from cart");
                    }
                    return apiResponse.successResponse(res, "Product removed from cart successfully");
                }).catch(err => {
                    return apiResponse.errorResponse(res, err.message);
                });
            }
        } catch (err) {
            return apiResponse.errorResponse(res, err.message);
        }
    }
];



/**
 * Adjust Product from cart.
 * 
 * @param {string}      cartId 
 * @param {string}      productId 
 * @param {number}      quantity 
 * @param {string}      action 
 * 
 * @returns {string}
 */
exports.adjustProductQuantity = [
    body("productId", "Please provide productId.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return ProductModel.findOne({ productId: value }).then(product => {
            if (!product) {
                return Promise.reject("Please provide valid productId.");
            }
            return true
        });
    }),
    body("cartId", "Please provide cartId.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return CartModel.findOne({ cartId: value }).then(cart => {
            if (!cart) {
                return Promise.reject("Please provide valid cartId.");
            }
            return true
        });
    }),
    body('quantity', 'Quantity must not be empty.').isLength({ min: 1 }).trim().toInt(),
    body('action', 'Please provide valid action.').isIn(['decrement', 'increment']),
    (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }
            else {
                let quantity = req.body.quantity;
                if (req.body.action === 'decrement') {
                    quantity = -quantity;
                }
                CartModel.updateOne({ cartId: req.body.cartId }, { $inc: { "items.$[ele].quantity": quantity } }, { arrayFilters: [{ "ele.productId": req.body.productId }] }).then(response => {
                    if (response && response.nModified === 0) {
                        throw new Error("Unable to remove product from cart");
                    }
                    return apiResponse.successResponse(res, "Product adjust successfully");
                }).catch(err => {
                    return apiResponse.errorResponse(res, err.message);
                })
            }
        } catch (err) {
            return apiResponse.errorResponse(res, err.message);
        }
    }
];



/**
 * return cart details.
 * 
 * @param {string}      cartId
 * 
 * @returns {Object}
 */
exports.getCartDetails = [
    body("cartId", "Please provide cartId.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return CartModel.findOne({ cartId: value }).then(cart => {
            if (!cart) {
                return Promise.reject("Please provide valid cartId.");
            }
            return true
        });
    }),
    (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }
            else {
                CartModel.aggregate([
                    {
                        $match: {
                            cartId: req.body.cartId
                        }
                    },
                    {
                        $lookup: {
                            from: PRODUCT_COLLECTION_NAME,
                            localField: "items.productId",
                            foreignField: "productId",
                            as: "productDetails"
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            "productDetails._id": 0,
                            "productDetails.__v": 0,
                            "productDetails.updatedAt": 0
                        }
                    }
                ]).then(response => {
                    return apiResponse.successResponseWithData(res, "Operation success", response)
                }).catch(err => {
                    return apiResponse.errorResponse(res, err.message);
                });
            }
        } catch (err) {
            return apiResponse.errorResponse(res, err.message);
        }
    }
];


/**
 * return cart.
 * 
 * @param {string}      cartId
 * 
 * @returns {Object}
 */
exports.getCart = [
    body("cartId", "Please provide cartId.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return CartModel.findOne({ cartId: value }).then(cart => {
            if (!cart) {
                return Promise.reject("Please provide valid cartId.");
            }
            return true
        });
    }),
    (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }
            else {
                CartModel.findOne({ cartId: req.body.cartId }).then(response => {
                    if (!response) {
                        return apiResponse.errorResponse(res, "Cart Not Found");
                    }
                    response = new CartData(response)
                    return apiResponse.successResponseWithData(res, "Operation success", response);
                }).catch(err => {
                    return apiResponse.errorResponse(res, err.message);
                });
            }
        } catch (err) {
            return apiResponse.errorResponse(res, err.message);
        }
    }
];


/**
 * return cart.
 * 
 * @param {string}      cartId
 * 
 * @returns {Object}
 */
exports.placeOrder = [
    body("cartId", "Please provide cartId.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return CartModel.findOne({ cartId: value }).then(cart => {
            if (!cart) {
                return Promise.reject("Please provide valid cartId.");
            }
            return true
        });
    }),
    (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }
            else {
                const orderData = {};
                const orderId = generateHashId(Date.now().toString());
                CartModel.findOne({ cartId: req.body.cartId }).then(response => {
                    if (!response) {
                        return apiResponse.errorResponse(res, "Cart Not Found");
                    }
                    orderData.items = response.items;
                    return UserModel.findOne({ userId: response.userId })
                }).then(response => {
                    if (!response && !response.address) {
                        return apiResponse.errorResponse(res, "User address Not Found");
                    }
                    orderData.address = response.address;
                    const order = new OrdersModel({
                        ...orderData,
                        orderId,
                    });
                    return order.save();
                }).then(response => {
                    return CartModel.updateOne({ cartId: req.body.cartId }, { $set: { items: [] } });
                }).then(response => {
                    return UserModel.updateOne({ cartId: req.body.cartId }, { $addToSet: { orders: orderId } });
                }).then(_res => {
                    return apiResponse.successResponse(res, "Order placed successfully.");
                }).catch(err => {
                    return apiResponse.errorResponse(res, err.message);
                });
            }
        } catch (err) {
            return apiResponse.errorResponse(res, err.message);
        }
    }
];

