module.exports = {
    PORT: process.env.PORT || 5000,
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
    DB_URL: process.env.DB_URL || "mongodb://localhost:27017",
    DB_NAME: process.env.DB_NAME || "node-apis",
    CART_COLLECTION_NAME: "carts",
    CATEGORY_COLLECTION_NAME: "category",
    PRODUCT_COLLECTION_NAME: "products",
    USER_COLLECTION_NAME: "users",
    ORDER_COLLECTION_NAME: "orders"
}