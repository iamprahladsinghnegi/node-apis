const express = require("express");
const UserController = require("../controllers/userController");
const router = express.Router();


router.post("/add/", UserController.addUser);
router.post("/updateAddress/:id", UserController.addAddressForUser);

module.exports = router;