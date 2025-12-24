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
exports.getTour = catchAsync(async (req, res) => {
  //console.log(req.params.slug);
  //1) get the data for the requested tour (including the )
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review ratings user',
  });
  //console.log(tours);
  //2)buld the template

  // render template using the data
  res.status(200).render('tour', {
    tour,
  });
});
