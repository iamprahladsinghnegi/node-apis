const CategoryModel = require("../models/categoryModel");
const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/response");
const generateHashId = require("../helpers/generateId");
const { PRODUCT_COLLECTION_NAME } = require("../constant/common");

function CategoryData(data) {
    this.categoryId = data.categoryId;
    this.name = data.name;
    this.products = data.products;
}


/**
 * All Category.
 * 
 * @returns {Object}
 */
exports.getAllCategory = [
    function (req, res) {
        let response = {
            name: [],
            count: 0
        }
        try {
            CategoryModel.find({}, { _id: 1, name: 1 }).then((categories) => {
                if (categories.length > 0) {
                    categories.forEach(ele => {
                        response.name.push(ele.name);
                    })
                    response.count = response.name.length;
                }
                return apiResponse.successResponseWithData(res, "Operation success", response);
            });
        } catch (err) {
            return apiResponse.errorResponse(res, err);
        }
    }
];

/**
 * All Category ids.
 * 
 * @returns {Object}
 */
exports.getAllCategoryIds = [
    function (req, res) {
        let response = {
            ids: [],
            count: 0
        }
        try {
            CategoryModel.find({}, { _id: 1, categoryId: 1 }).then((categories) => {
                if (categories.length > 0) {
                    categories.forEach(ele => {
                        response.ids.push(ele.categoryId);
                    })
                    response.count = response.ids.length;
                }
                return apiResponse.successResponseWithData(res, "Operation success", response);
            });
        } catch (err) {
            return apiResponse.errorResponse(res, err);
        }
    }
];

/**
 * Category Details.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */

exports.getCategoryById = [
    function (req, res) {
        try {
            let categoryData = {}
            CategoryModel.findOne({ categoryId: req.params.id }).then((category) => {
                if (category !== null) {
                    categoryData = new CategoryData(category);
                }
                return apiResponse.successResponseWithData(res, "Operation success", categoryData);
            }).catch(err => {
                return apiResponse.errorResponse(res, err.message);
            });
        } catch (err) {
            return apiResponse.errorResponse(res, err.message);
        }
    }
];

/**
 * Category and Product Details.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */

exports.getProductsDetailsByCategoryId = [
    function (req, res) {
        try {
            CategoryModel.aggregate([
                {
                    $match: {
                        categoryId: req.params.id
                    }
                },
                {
                    $lookup: {
                        from: PRODUCT_COLLECTION_NAME,
                        localField: "products",
                        foreignField: "productId",
                        as: "productDetails"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        "productDetails._id": 0,
                        "productDetails.__v": 0,
                        "productDetails.updatedAt": 0
                    }
                }
            ]).then((category) => {
                return apiResponse.successResponseWithData(res, "Operation success", category);
            }).catch(err => {
                return apiResponse.errorResponse(res, err.message);
            });
        } catch (err) {
            return apiResponse.errorResponse(res, err.message);
        }
    }
];

/**
 * Add Category.
 * 
 * @param {string}      name 
 * 
 * @returns {Object}
 */
exports.addCategory = [
    body("name", "Name must not be empty.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return CategoryModel.findOne({ name: value }).then(category => {
            if (category) {
                return Promise.reject("Category already exist.");
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
                const categoryId = generateHashId(req.body.name);
                const category = new CategoryModel(
                    {
                        categoryId,
                        name: req.body.name,
                        products: []
                    });

                category.save().then(_res => {
                    let categoryData = new CategoryData(category);
                    return apiResponse.successResponseWithData(res, "Category added successfully", categoryData);
                }).catch(err => {
                    return apiResponse.errorResponse(res, err.message);
                });
            }
        } catch (err) {
            return apiResponse.errorResponse(res, err.message);
        }
    }
];
