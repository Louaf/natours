const express = require('express');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router.use((req, res, next) => {
  console.log('Review router here !!');
  next();
});

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  )
  .get(reviewController.getAllReviews);

router.route('/:id').delete(reviewController.deleteReview);
module.exports = router;
