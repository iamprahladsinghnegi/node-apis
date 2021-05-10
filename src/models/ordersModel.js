const mongoose = require('mongoose');
const { ORDER_COLLECTION_NAME } = require('../constant/common');

const OrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    items: [{ _id: false, quantity: { type: Number, required: true }, productId: { type: String, required: true } }],
    address: {
        locality: { type: String },
        street: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: Number, required: true }
    }
}, { timestamps: true });

module.exports = mongoose.model(ORDER_COLLECTION_NAME, OrderSchema);