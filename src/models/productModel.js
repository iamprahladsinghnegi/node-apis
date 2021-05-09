const mongoose = require('mongoose');
const { PRODUCT_COLLECTION_NAME } = require('../constant/common');

const ProductSchema = new mongoose.Schema({
    productId: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    categories: [{ type: String, required: true }],
    images: [{ type: String, required: true }]
}, { timestamps: true })

module.exports = mongoose.model(PRODUCT_COLLECTION_NAME, ProductSchema);