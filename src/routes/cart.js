const express = require("express");
const CartController = require("../controllers/cartController");
const router = express.Router();

router.get("/", CartController.getCart);
router.get("/details/", CartController.getCartDetails);
router.get("/all/:id", CartController.getAllCartByUserId);
router.post("/addProduct/", CartController.addProductToCart);
router.post("/removeProduct/", CartController.removeProductFromCart);
router.post("/adjust/", CartController.adjustProductQuantity);
router.post("/add/:id", CartController.addCart);
router.post("/placeOrder/", CartController.placeOrder);

module.exports = router;