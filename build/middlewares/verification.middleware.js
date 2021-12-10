"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../database/user.model"));
const db_connect_1 = require("../database/db.connect");
async function verifyToken(req, res, next) {
    try {
        const token = req.cookies.accessToken;
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await user_model_1.default.findById(decodedToken._id);
        if (!user)
            return res.status(404).json({ status: false, message: "User not found" });
        const blacklisted = await db_connect_1.redisClient.get('BL_' + user._id);
        if (token === blacklisted)
            return res.status(401).json({ status: false, message: "Blacklisted token" });
        req.user = user;
        req.token = token;
        next();
    }
    catch (err) {
        res.json({ status: false, error: err });
    }
}
exports.verifyToken = verifyToken;
async function verifyRefreshToken(req, res, next) {
    try {
        const token = req.cookies.refreshToken;
        if (!token)
            return res.status(401).json({ status: false, message: "No token provided" });
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const user = await user_model_1.default.findById(decodedToken._id);
        if (!user)
            res.status(404).json({ status: false, message: "User not found" });
        const memory = await db_connect_1.redisClient.get(user.id);
        if (!memory)
            return res.status(401).json({ status: false, message: "Token is not in store." });
        if (JSON.parse(memory).token !== token)
            return res.status(401).json({ status: false, message: "Token is not same in store." });
        req.user = user;
        next();
    }
    catch (err) {
        res.json({ status: false, error: err });
    }
}
exports.verifyRefreshToken = verifyRefreshToken;
