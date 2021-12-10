"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTokens = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_connect_1 = require("../database/db.connect");
function generateAccessToken(userId) {
    const token = jsonwebtoken_1.default.sign({ _id: userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_AGE,
    });
    return token;
}
exports.generateAccessToken = generateAccessToken;
async function generateRefreshToken(userId) {
    const token = jsonwebtoken_1.default.sign({ _id: userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_AGE,
    });
    await db_connect_1.redisClient.set(userId, JSON.stringify({
        token: token,
        expiresIn: process.env.REFRESH_TOKEN_AGE
    }));
    return token;
}
exports.generateRefreshToken = generateRefreshToken;
async function deleteTokens(userId, token) {
    try {
        await db_connect_1.redisClient.del(userId);
        await db_connect_1.redisClient.set('BL_' + userId, token); //blacklisting this tokens
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}
exports.deleteTokens = deleteTokens;
