const jwt = require("jsonwebtoken");

function jwt_verify(req, res, callback) {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).send('No token provided');
        return;
    }
    jwt.verify(token, 'secret', async (err, decoded) => {
        if (err) {
            res.status(401).send('Invalid token');
            return;
        }
        try {
            callback(req, res, decoded);
        } catch (e) {
            res.status(500).send(e.message);
        }
    });
}

module.exports = jwt_verify;