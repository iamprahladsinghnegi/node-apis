const mongoose = require('mongoose');
const { CATEGORY_COLLECTION_NAME } = require('../constant/common');

const CategorySchema = new mongoose.Schema({
    categoryId: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    products: [{ type: String, required: true }],
})

module.exports = mongoose.model(CATEGORY_COLLECTION_NAME, CategorySchema);