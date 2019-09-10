const jwt = require('jsonwebtoken');

const signToken = (id, expiresTime = process.env.JWT_LOGIN_EXPIRES_IN) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: expiresTime });
};

module.exports = {
  createToken: function(req, res, next) {
    req.token = signToken(req.auth.id);
    return next();
  },
  sendToken: function(req, res) {
    res.setHeader('x-auth-token', req.token);
    return res.status(200).send(JSON.stringify(req.user));
  }
};
