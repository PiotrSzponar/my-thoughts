// Helper function to handle errors
// - they are passed down to the globalErrorHandler middleware
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
