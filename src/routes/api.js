const express = require("express");
const productRouter = require("./product");
const categoryRouter = require('./category');
const app = express();

app.use("/product/", productRouter);
app.use("/category/", categoryRouter);


module.exports = app;