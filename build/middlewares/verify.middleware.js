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
            return res.status(400).json({ status: false, message: "User not found" });
        const blacklisted = await db_connect_1.redisClient.get('BL_' + user._id);
        if (token === blacklisted)
            return res.status(401).json({ status: false, message: "Blacklisted token" });
        req.user = user;
        req.token = token;
        next();
    }
    catch (err) {
        return res.status(401).json({ status: false, message: "Your token is not valid.", data: err });
    }
}
exports.verifyToken = verifyToken;
async function verifyRefreshToken(req, res, next) {
    try {
        const token = req.cookies.refreshToken;
        if (!token)
            return res.status(401).json({ error: "Unauthorized, Access Denied. No token provided" });
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const user = await user_model_1.default.findById(decodedToken._id);
        if (!user)
            res.status(400).json({ status: false, message: "User not found" });
        const mem = await db_connect_1.redisClient.get(user.id);
        if (!mem)
            return res.status(401).json({ message: "Invalid request. Token is not in store." });
        if (JSON.parse(mem).token !== token)
            return res.status(401).json({ message: "Invalid request. Token is not same in store." });
        req.user = user;
        next();
    }
    catch (err) {
        console.error(err);
        return res.status(401).json({ status: false, message: "Your token is not valid.", data: err });
    }
}
exports.verifyRefreshToken = verifyRefreshToken;
