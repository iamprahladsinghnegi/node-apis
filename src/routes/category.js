const express = require("express");
const CategoryController = require("../controllers/categoryController");
const router = express.Router();

router.get("/", CategoryController.getAllCategoryIds);
router.get("/name", CategoryController.getAllCategory);
router.get("/:id", CategoryController.getCategoryById);
router.get("/detailed/:id", CategoryController.getProductsDetailsByCategoryId);
router.post("/", CategoryController.addCategory);

module.exports = router;