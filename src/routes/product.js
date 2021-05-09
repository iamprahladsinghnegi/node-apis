const express = require("express");
const ProductController = require("../controllers/productController");
const router = express.Router();

router.get("/", ProductController.getAllProductsIds);
router.get("/:id", ProductController.getProductById);
router.post("/", ProductController.addProduct);

module.exports = router;