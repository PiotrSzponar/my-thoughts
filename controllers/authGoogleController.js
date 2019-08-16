const jwt = require('jsonwebtoken');


// check if Token exists on request Header and attach token to request as attribute
exports.checkTokenMW = (req, res, next) => {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        req.token = bearerHeader.split(' ')[1];
        next();
    } else {
        res.sendStatus(403);
    }
};

// Verify Token validity and attach token data as request attribute
exports.verifyToken = (req, res) => {
    console.log(req);
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            console.log(err);
            res.sendStatus(403);
        } else {
            return req.authData = authData;
        }
    })
};

// Issue Token
exports.signToken = (req, res) => {
    jwt.sign({ userId: req.user._id }, 'secretkey', { expiresIn: '5 min' }, (err, token) => {
        if (err) {
            res.sendStatus(500);
        } else {
            console.log("Your token", token);
            res.json({ token });
        }
    });
}