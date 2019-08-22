exports.getLoginUser = (req, res) => {
  console.log(req.user)
  res.status(200).json({
    status: 'success',
    message: `Hey ${req.user.name} - you are a logged in user!`
  });
};

exports.getAdmin = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `Hey ${req.user.name} - you have admin role!`
  });
};
