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

// GEO JSON STUFF
// two ways of endpoints url /tours-within?distance=23&center = lat,lng &unit=mi
// or /tours-within/233/center/45,45/unit/mi
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

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
