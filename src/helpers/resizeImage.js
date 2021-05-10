const sharp = require("sharp");
const path = require("path");

const resizeImages = async (req, res, next) => {
    if (!req.files) return next();
    req.body.images = {
        original: [],
        resize_200x200: [],
        resize_400x400: []
    };
    const resize_option = ['200x200', '400x400'];
    const promiseArray = []
    req.files.map(file => {
        const originalFile = file.path.replace(`${path.join(__dirname, `../../`)}`, '/');
        req.body.images.original.push(originalFile);
        for (let index in resize_option) {
            const newFilename = `${resize_option[index]}-${file.filename}`;
            const destination = `${path.join(__dirname, `../../uploads/${resize_option[index]}/`)}${newFilename}`;
            const resize = parseInt(resize_option[index].split('x')[0]);
            let promise = sharp(file.path).resize(resize).toFile(destination).then(_res => {
                const destinationFile = destination.replace(`${path.join(__dirname, `../../`)}`, '/');
                req.body.images[`resize_${resize_option[index]}`].push(destinationFile);
            })
            promiseArray.push(promise);
        }
    })
    Promise.all(promiseArray).then(_res => {
        next();
    }).catch(err => {
        console.log(err);
        next();
    });
};

module.exports = resizeImages;