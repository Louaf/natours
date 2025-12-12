module.exports = (fn) => {
  return (req, res, next) => {
    //console.log('hi');
    fn(req, res, next).catch((err) => next(err));
  };
};
