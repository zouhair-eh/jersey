/**
 * @file review.routes.js
 * @description Routes for product reviews (nested under /api/products/:productId/reviews).
 */

const express = require('express');
const { getReviews, createReview } = require('../controllers/review.controller');
const { protect } = require('../middlewares/auth.middleware');

// mergeParams allows access to :productId from parent router
const router = express.Router({ mergeParams: true });

router.get('/',  getReviews);
router.post('/', protect, createReview);

module.exports = router;
