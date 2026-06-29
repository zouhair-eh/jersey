/**
 * @file review.controller.js
 * @description Controllers for product reviews.
 */

const Review  = require('../models/Review.model');
const Product = require('../models/Product.model');

/**
 * @desc    Get reviews for a product
 * @route   GET /api/products/:productId/reviews
 * @access  Public
 */
exports.getReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reviews = await Review.find({ product_id: productId, isActive: true })
      .populate('author_id', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a review for a product
 * @route   POST /api/products/:productId/reviews
 * @access  Private
 */
exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existing = await Review.findOne({
      author_id: req.user._id,
      product_id: productId,
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      author_id:  req.user._id,
      product_id: productId,
      rating:     req.body.rating,
      comment:    req.body.comment || '',
    });

    // Populate author for response
    await review.populate('author_id', 'name avatar');

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
