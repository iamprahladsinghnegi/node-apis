const ProductModel = require("../models/productModel");
const CategoryModel = require("../models/categoryModel");
const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/response");
const generateHashId = require("../helpers/generateId");
const upload = require("../helpers/fileUpload");
const resizeImages = require("../helpers/resizeImage");

function ProductData(data) {
    this.productId = data.productId;
    this.name = data.name;
    this.categories = data.categories;
    this.price = data.price;
    this.images = data.images;
    this.createdAt = data.createdAt;
}

/**
 * All Product ids.
 * 
 * @returns {Object}
 */
exports.getAllProductsIds = [
    function (req, res) {
        let response = {
            ids: [],
            count: 0
        };
        try {
            ProductModel.find({}, { _id: 1, productId: 1 }).then((products) => {
                if (products.length > 0) {
                    products.forEach(ele => {
                        response.ids.push(ele.productId);
                    })
                    response.count = response.ids.length;
                }
                return apiResponse.successResponseWithData(res, "Operation success", response);
            }).catch(err => {
                return apiResponse.errorResponse(res, err.message);
            });
        } catch (err) {
            return apiResponse.errorResponse(res, err.message);
        }
    }
];

/**
 * Product Details.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */

exports.getProductById = [
    function (req, res) {
        try {
            let productData = {};
            ProductModel.findOne({ productId: req.params.id }).then((product) => {
                if (product !== null) {
                    productData = new ProductData(product);
                }
                return apiResponse.successResponseWithData(res, "Operation success", productData);
            }).catch(err => {
                return apiResponse.errorResponse(res, err.message);
            });
        } catch (err) {
            return apiResponse.errorResponse(res, err.message);
        }
    }
];



/**
 * Add Product.
 * 
 * @param {string}      name 
 * @param {number}      price
 * @param {Array<string>}      categories
 * @param {Array<string>}      images
 * 
 * @returns {Object}
 */
exports.addProduct = [
    upload.array('images'),
    resizeImages,
    body("price", "Price must not be empty.").isLength({ min: 1 }).trim().toFloat(),
    body("categories", "Provide at least one Category.").isLength({ min: 1 }),
    body("name", "Name must not be empty.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return ProductModel.findOne({ name: value }).then(product => {
            if (product) {
                return Promise.reject("Product already exist.");
            }
        });
    }),
    (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }
            else {
                // const filePath = req.files.map(x => x.path);
                const filePath = req.body.images;
                const productId = generateHashId(req.body.name);
                const product = new ProductModel(
                    {
                        productId,
                        name: req.body.name,
                        price: req.body.price,
                        categories: req.body.categories,
                        images: filePath,
                    });

                product.save().then(_res => {
                    let updatedQuery = [];
                    req.body.categories.forEach(x => {
                        const categoryId = generateHashId(x);
                        updatedQuery.push({
                            updateOne: {
                                filter: {
                                    name: x
                                },
                                update: {
                                    $set: { categoryId },
                                    $addToSet: { products: productId }
                                },
                                upsert: true
                            }
                        }
                        )
                    })
                    return CategoryModel.bulkWrite(updatedQuery);
                }).then(_res => {
                    let productData = new ProductData(product);
                    return apiResponse.successResponseWithData(res, "Product added successfully", productData);
                }).catch(err => {
                    return apiResponse.errorResponse(res, err.message);
                });
            }
        } catch (err) {
            return apiResponse.errorResponse(res, err.message);
        }
    }
];
