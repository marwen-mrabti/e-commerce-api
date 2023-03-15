const path = require("path");
const sharp = require("sharp");
const CustomAPIError = require("../errors/custom-api");

const uploadImage = async (req, res, next) => {
  //
  if (req.method === "PATCH" && (!req.files || Object.keys(req.files).length === 0)) {
    return next();
  }

  //check if file is uploaded
  if (req.method === "POST" && (!req.files || Object.keys(req.files).length === 0)) {
    throw new CustomAPIError("No files were uploaded");
  }

  const productImage = req.files.image;

  //check file type
  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomAPIError("Please upload an image file");
  }

  //file extension
  const fileExtension = path.extname(productImage.name);
  //file name
  const fileName = productImage.name.split(".").slice(0, -1).join(".");
  const imageName = `${fileName}-${Date.now()}.${fileExtension}`;
  //file path
  const imagePath = path.join(__dirname, "../public/uploads", imageName);
  //move file to uploads folder
  await productImage.mv(imagePath);

  // check file size and resize if necessary
  if (productImage.size > process.env.MAX_FILE_UPLOAD) {
    const outputPath = path.join(__dirname, "../public/uploads", imageName);
    await sharp(imagePath)
      .resize({ width: 500 })
      .toFile(outputPath, (err, info) => {
        if (err) {
          return next(err);
        }
        // Delete the original file
        fs.unlinkSync(imagePath);
      });
  }

  req.body.image = `/uploads/${imageName}`;
  return next();
};

module.exports = {
  uploadImage,
};
