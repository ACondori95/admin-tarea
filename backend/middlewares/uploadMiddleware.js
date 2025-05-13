const multer = require("multer");

// Configure storage
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten los formatos .jpeg, .jpg y .png"), false);
  }
};

const upload = multer({storage, fileFilter});

module.exports = upload;
