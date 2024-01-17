const { unlinkSync, existsSync } = require("fs");

const deleteImage = (image) => {
  image &&
    existsSync(`./public/img/${image}`) &&
    unlinkSync(`./public/img/${image}`);
};

module.exports = deleteImage;