const { body } = require("express-validator");

const authUser = (req, res, next) => {
    body("userId", "Please provide userId.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return UserModel.findOne({ userId: value }).then(user => {
            if (!user) {
                return Promise.reject("User not exist.");
            }
            return true
        });
    })
}


const verifyProduct = (req, res, next) => {
    body("productId", "Please provide productId.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return ProductModel.findOne({ productId: value }).then(product => {
            if (!product) {
                return Promise.reject("Please provide valid productId.");
            }
            return true
        });
    })
}

const verifyCart = (req, res, next) => {
    body("cartId", "Please provide cartId.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return CartModel.findOne({ cartId: value }).then(cart => {
            if (!cart) {
                return Promise.reject("Please provide valid cartId.");
            }
            return true
        });
    })
}

module.exports = {
    authUser,
    verifyProduct,
    verifyCart
}