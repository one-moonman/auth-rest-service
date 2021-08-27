const jwt = require('jsonwebtoken');
const redisClient = require('../databases/redis');

const verifyToken = (req, res, next) => {
      try {
            // Bearer tokenstring
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jwt.verify(token, process.env.ACCESTOKEN_SECRET);
            req.userData = decodedToken;
            req.token = token;

            // varify blacklisted access token.
            redisClient.get('BL_' + decodedToken._id, (err, data) => {
                  if (err) throw err;
                  if (data === token) return res.status(401).json({ status: false, message: "blacklisted token." });
                  next();
            })
      } catch (err) {
            return res.status(401).json({ status: false, message: "Your session is not valid.", data: err });
      }
}

const verifyRefreshToken = (req, res, next) => {
      const token = req.body.token;
      if (!token) return res.status(401).json({ error: "Unauthorized, Access Denied. No token provided" });

      try {
            const decodedToken = jwt.verify(token, process.env.REFRESHTOKEN_SECRET);
            req.userData = decodedToken;
            redisClient.get(decodedToken._id, (err, data) => {
                  if (err) throw err;
                  if (!data) return res.status(401).json({ message: "Invalid request. Token is not in store." });
                  if (JSON.parse(data).token != token) return res.status(401).json({ message: "Invalid request. Token is not same in store." });
                  next();
            })
      } catch (err) {
            return res.status(401).json({ message: "Your session is not valid.", data: err });
      }
}

module.exports = {
      verifyToken,
      verifyRefreshToken
}