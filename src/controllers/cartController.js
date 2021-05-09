const CartModel = require("../models/cartModel ");
const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/response");
const generateHashId = require("../helpers/generateId");
const { authUser, verifyProduct, verifyCart } = require("../middlewares");

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
exports.getAllCarts = [
    authUser,
    (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
        }

        try {
            const cartId = generateHashId(Date.now().toString());
            const cart = new CartModel({
                cartId,
                userId: req.body.userId
            })
            cart.save().then(_res => {
                let cartData = new CartData(cart)
                return apiResponse.successResponseWithData(res, "Cart created successfully", cartData);
            });
        } catch (err) {
            return apiResponse.errorResponse(res, err);
        }
    }
];


/**
 * Get All Cart for User.
 * 
 * @returns {Object}
 */
exports.getAllCart = [
    authUser,
    function (req, res) {
        let response = {
            ids: [],
            count: 0
        }
        try {
            CategoryModel.find({}, { _id: 1, cartId: 1 }).then((categories) => {
                if (categories.length > 0) {
                    categories.forEach(ele => {
                        response.ids.push(ele.cartId);
                    })
                    response.count = response.ids.length;
                }
                return apiResponse.successResponseWithData(res, "Operation success", response);
            });
        } catch (err) {
            return apiResponse.errorResponse(res, err);
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
 * @returns {Object}
 */
exports.addProductToCart = [
    body("quantity", "Quantity must not be empty.").isLength({ min: 1 }).isNumeric().toInt(),
    verifyProduct,
    verifyCart,
    (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }
            else {

                CartModel.updateOne({ cartId: req.body.cartId }, { $addToSet: { items: { quantity: req.body.quantity, productId: req.body.productId } } }).then(response => {
                    if (response && response.nModified === 0) {
                        throw new Error("Unable to add product to cart");
                    }
                    return apiResponse.successResponse(res, "Product added to cart successfully");
                }).catch(err => {
                    return apiResponse.errorResponse(res, err);
                })
            }
        } catch (err) {
            return apiResponse.errorResponse(res, err);
        }
    }
];


/**
 * Remove Product from cart.
 * 
 * @param {string}      cartId 
 * @param {string}      productId 
 * 
 * @returns {Object}
 */
exports.removeProductFromCart = [
    verifyProduct,
    verifyCart,
    (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }
            else {

                CartModelCartModel.updateOne({ cartId: req.body.cartId }, { $pull: { items: { itemId } } }).then(response => {
                    if (response && response.nModified === 0) {
                        throw new Error("Unable to remove product from cart");
                    }
                    return apiResponse.successResponse(res, "Product removed from cart successfully");
                }).catch(err => {
                    return apiResponse.errorResponse(res, err);
                })
            }
        } catch (err) {
            return apiResponse.errorResponse(res, err);
        }
    }
];