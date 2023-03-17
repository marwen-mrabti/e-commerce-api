const fs = require("fs");
const path = require("path");
const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/bad-request");
const CustomAPIError = require("../errors/custom-api");
const NotFoundError = require("../errors/not-found");
const Product = require("../models/Product");
const Review = require("../models/Review");

/**
 * @desc    Get all products
 * @route   GET /api/v1/products
 * @access  Public
 * @param req
 * @param res
 * @returns {Promise<void>} [{...product},...]
 */
const getProducts = async (req, res) => {
  const products = await Product.find().populate({
    path: "reviews",
    select: "rating title",
  });
  res.status(StatusCodes.OK).json(products);
};

/**
 * @desc    Get single product
 * @route   GET /api/v1/products/:productId
 * @access  Public
 * @param req
 * @param res
 * @returns {Promise<void>} {...product}
 */
const getProductById = async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId).populate({
    path: "reviews",
    select: "rating title",
  });
  if (!product) {
    throw new NotFoundError(`Product with id ${productId} not found`);
  }

  res.status(200).json(product);
};

/**
 * @desc    Create a product
 * @route   POST /api/v1/products/new
 * @access  Private (admin)
 */
const createProduct = async (req, res) => {
  const { id: userId } = req.user;

  const { name, price, description, image, category, company, colors, inventory } =
    req.body;

  const product = await Product.create({
    user: userId,
    name,
    price,
    description,
    image,
    category,
    company,
    colors: colors.split(","),
    inventory,
  }).catch((err) => {
    const imagePath = path.join(__dirname, "../public", image);
    fs.unlink(imagePath, (err) => {
      if (err) {
        return;
      }
    });
    throw new BadRequestError(`product not created :: ${err.message}`);
  });

  res.status(StatusCodes.CREATED).json(product);
};

/**
 * @desc   Update a product
 * @route  PUT /api/v1/products/edit/:productId
 * @param {*} req
 * @param {*} res
 */
const updateProduct = async (req, res) => {
  const { productId } = req.params;
  let product = await Product.findById(productId);

  //check if product exists
  if (!product) {
    throw new NotFoundError(`Product with id ${productId} not found`);
  }

  //remove old image
  if (req.body.image && product.image) {
    const imagePath = path.join(__dirname, "../public", `${product.image}`);
    fs.unlink(imagePath, (err) => {
      if (err) {
        return;
      }
    });
  }

  //update product
  product = await Product.findByIdAndUpdate(
    productId,
    { $set: req.body },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(StatusCodes.OK).json(product);
};

/**
 * @desc  Delete a product
 * @route DELETE /api/v1/products/delete/:productId
 * @param {*} req
 * @param {*} res
 */
const deleteProduct = async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);

  if (!product) {
    throw new NotFoundError(`Product with id ${productId} not found`);
  }

  await Review.deleteMany({ product: productId });

  if (product.image) {
    const imagePath = path.join(__dirname, "../public", `${product.image}`);
    fs.unlink(imagePath, (err) => {
      if (err) {
        return;
      }
    });
  }
  await product.remove();
  res.status(StatusCodes.OK).json({ message: "Product deleted successfully" });
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
