const crypto = require('crypto');

const generateHashId = function (str) {
    return crypto.createHash('sha1').update(str).digest('hex');
}

module.exports = generateHashId;