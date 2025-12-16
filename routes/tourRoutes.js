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
router.route('/:id').get(tourController.getTour);
router.route('/').get(tourController.getAllTours);

router.use(authController.protect);
router.use(authController.restrictTo('admin', 'lead-guide'));
router
  .route('/monthly-plan/:year')
  .get(
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );
router.route('/').post(tourController.createTour);
router
  .route('/:id')
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
