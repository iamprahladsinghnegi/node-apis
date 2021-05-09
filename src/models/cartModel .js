const mongoose = require('mongoose');
const { CART_COLLECTION_NAME } = require('../constant/common');

const CartSchema = new mongoose.Schema({
    cartId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    items: [{ _id: false, quantity: { type: Number, required: true }, productId: { type: String, required: true } }]
});

module.exports = mongoose.model(CART_COLLECTION_NAME, CartSchema);