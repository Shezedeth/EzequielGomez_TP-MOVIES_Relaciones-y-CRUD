const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, "./public/img");
  },
  filename: (req, file, cb) => {
    return cb(
      null,
      `${Date.now()}_movies_${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {

  console.log(file,'<<<<<<');
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    req.fileValidatorError = {
      image: `Solo se permiten imágenes jpg | jpeg | png | gif | webp`,
    };

    return cb(null, false, req.fileValidatorError);
  }

  return cb(null, true);
};


const upload = multer({
  storage,
  fileFilter
});

module.exports = upload;
