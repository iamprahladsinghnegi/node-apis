const UserModel = require("../models/userModel");
const { body, param, validationResult } = require("express-validator");
const apiResponse = require("../helpers/response");
const generateHashId = require("../helpers/generateId");

function UserData(data) {
    this.name = data.name;
    this.userId = data.userId;
    this.carts = data.carts;
    this.orders = data.orders;
    this.address = data.address;
}


/**
 * Add new User.
 * @param   {string}    name
 * 
 * @returns {Object}
 */
exports.addUser = [
    body("name", "Name must not be empty.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return UserModel.findOne({ name: value }).then(user => {
            if (user) {
                return Promise.reject("User already exist with same name.");
            }
        });
    }),
    function (req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
        }

        try {
            const userId = generateHashId(Date.now().toString());
            const user = new UserModel({
                userId,
                name: req.body.name,
                carts: [],
                orders: [],
                address: {}
            })
            user.save().then(_res => {
                let userData = new UserData(user)
                return apiResponse.successResponseWithData(res, "User added successfully", userData);
            }).catch(err => {
                return apiResponse.errorResponse(res, err.message);
            });
        } catch (err) {
            return apiResponse.errorResponse(res, err.message);
        }
    }
];


/**
 * Add or Update Address for user.
 * @param   {string}    locality
 * @param   {string}    street
 * @param   {string}    city
 * @param   {number}    postalCode
 *  
 * @returns {string}
 */
exports.addAddressForUser = [
    param("id", "Please provide userId.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return UserModel.findOne({ userId: value }).then(user => {
            if (!user) {
                return Promise.reject("User not exist.");
            }
        });
    }),
    body("street", "Street must not be empty.").isLength({ min: 1 }).trim(),
    body("city", "City must not be empty.").isLength({ min: 1 }).trim(),
    body("postalCode", "Postal code length must be 6.").isLength({ max: 6, min: 6 }).isNumeric().withMessage("Please provide valid postal code.").toInt(),
    function (req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
        }

        try {
            UserModel.updateOne({ userId: req.params.id }, { $set: { "address.locality": req.body.locality, "address.city": req.body.city, "address.street": req.body.street, "address.postalCode": req.body.postalCode } }).then(response => {
                if (!response && response.nModified === 0 && response.ok === 0) {
                    return apiResponse.errorResponse(res, "Unable to update address.");
                }
                return apiResponse.successResponse(res, "Address updated successfully.");
            }).catch(err => {
                return apiResponse.errorResponse(res, err.message);
            });
        } catch (err) {
            return apiResponse.errorResponse(res, err.message);
        }
    }
];

