const multer = require("multer");

const fileValidation = {
  image: ["image/jpeg", "image/png", "image/gif" , "image/webp"],
  file: ["application/pdf", "application/msword"],
  video: ["video/mp4"],
};

function fileUpload(customValidation = []) {
  try {
    const storage = multer.diskStorage({});
    function fileFilter(req, file, cb) {
      if (customValidation.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb("In-valid file format", false);
      }
    }
    const upload = multer({ fileFilter, storage });
    return upload;
  } catch (error) {
    console.log("Multer error");
  }
}
module.exports = {
  fileValidation,
  fileUpload,
};




