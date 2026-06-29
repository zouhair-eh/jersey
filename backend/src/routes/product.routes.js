/**
 * @file product.routes.js
 * @description Routes for product CRUD operations.
 */

const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Include review routes as nested resource
const reviewRoutes = require('./review.routes');

const router = express.Router();

// Re-route to review router for /api/products/:productId/reviews
router.use('/:productId/reviews', reviewRoutes);

// Public routes
router.get('/',    getProducts);
router.get('/:id', getProduct);

// Protected routes (expert only)
router.post('/',       protect, authorize('expert', 'admin'), createProduct);
router.put('/:id',     protect, updateProduct);
router.delete('/:id',  protect, deleteProduct);

module.exports = router;
