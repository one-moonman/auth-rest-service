const express = require('express');
const app = express();
const cors = require('cors');
const connectMongoDB = require('./databases/mongo');
const authController = require('./controllers/auth.controller.js');
const verificationMiddleware = require('./middlewares/verification.middleware.js');

require('dotenv').config();
connectMongoDB();
app.use(express.json());
app.use(cors({ credentials: true }));

app.post('/register', authController.Register);
app.post('/login', authController.Login);
app.get('/logout', verificationMiddleware.verifyToken, authController.Logout);
app.post('/token', verificationMiddleware.verifyRefreshToken, authController.GetTokens);

const port = 3002;
app.listen(port, () => console.log('Server listening on port ' + port));