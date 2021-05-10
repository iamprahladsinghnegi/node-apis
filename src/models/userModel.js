const mongoose = require('mongoose');
const { USER_COLLECTION_NAME } = require('../constant/common');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    userId: { type: String, required: true, unique: true },
    carts: [{ type: String, required: true, }],
    orders: [{ type: String, required: true, }],
    address: {
        locality: { type: String },
        street: { type: String },
        city: { type: String },
        postalCode: { type: Number }
    }
}, { timestamps: true });

module.exports = mongoose.model(USER_COLLECTION_NAME, UserSchema);