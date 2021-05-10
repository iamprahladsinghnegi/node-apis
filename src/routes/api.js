const express = require("express");
const productRouter = require("./product");
const categoryRouter = require('./category');
const cartRouter = require('./cart');
const userRouter = require('./user');
const app = express();

app.use("/product/", productRouter);
app.use("/category/", categoryRouter);
app.use("/cart/", cartRouter);
app.use("/user/", userRouter);


module.exports = app;