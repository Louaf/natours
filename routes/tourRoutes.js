const express = require('express');
const authController = require('./../controllers/authController');
const tourController = require('../controllers/tourController');
const reviewRouter = require('./reviewRoutes');
///////////////////
const router = express.Router();

//router.param('id', tourController.checkId);
router.use((req, res, next) => {
  console.log('tourRouter');
  next();
});
// reroute nested route to its router
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheepest')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
