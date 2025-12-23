const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) get tours data
  const tours = await Tour.find();
  // 2)build template
  // 3) rendering the template
  res.status(200).render('overview', {
    tours,
  });
});
exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    tours,
  });
};
