const User = require('../databases/models/user.model.js');
const redisClient = require('../databases/redis');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

function generateRefreshToken(userId /* payload */) {
      const refreshToken = jwt.sign({ _id: userId }, process.env.REFRESHTOKEN_SECRET, { expiresIn: process.env.REFRESHTOKEN_EXPIRATION });
      redisClient.get(userId.toString(), (err, data) => {
            if (err) throw err;
            redisClient.set(userId.toString(), JSON.stringify({ token: refreshToken }));
      })
      return refreshToken;
}

function generateAccesToken(userId) {
      return jwt.sign({ _id: userId }, process.env.ACCESTOKEN_SECRET, { expiresIn: process.env.ACCESTOKEN_EXPIRATION });
}

async function Register(req, res) {
      const { name, email, password } = req.body;
      try {
            let user = await User.findOne({ email });
            if (user) return res.status(400).json({ error: "User already exists" });
            const hashedPassword = await bcrypt.hash(password, 12);
            user = new User({
                  name,
                  email,
                  password: hashedPassword
            });
            const newUser = await user.save();
            res.send(newUser);
      } catch (err) {
            res.status(400).send(err);
      }
}

async function Login(req, res) {
      const { email, password } = req.body;
      try {
            let user = await User.findOne({ email });
            if (!user) return res.status(400).json({ error: "Invalid Email Credential" });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ erorr: "Invalid Password Credential" });

            const accesToken = generateAccesToken(user._id)
            const refreshToken = generateRefreshToken(user._id);
            res.header('auth-token', refreshToken).json({ accesToken, refreshToken });
      } catch (err) {
            res.status(400).send(err);
      }
}

async function Logout(req, res) {
      const userId = req.userData._id;
      const token = req.token;
      await redisClient.del(userId);
      await redisClient.set('BL_' + userId, token);
      return res.json({ message: "succes" });
}

async function GetTokens(req, res) {
      const userId = req.userData._id.sub;
      const accesToken = generateAccesToken(userId);
      const refreshToken = generateRefreshToken(userId);
      return res.json({ accesToken, refreshToken })
}

module.exports = {
      Register,
      Login,
      Logout,
      GetTokens
}