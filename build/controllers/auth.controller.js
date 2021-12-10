"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = exports.logout = exports.login = exports.register = void 0;
const util = __importStar(require("../common/jwt.common"));
const crypt = __importStar(require("../common/bcrypt.common"));
const user_model_1 = __importDefault(require("../database/user.model"));
async function register(req, res) {
    const { username, email, password } = req.body;
    try {
        let user = await user_model_1.default.findOne({ email }).exec();
        if (user)
            return res.status(400).json({ status: false, message: "User already exists" });
        const { salt, hash } = await crypt.generatePassword(password);
        user = new user_model_1.default({
            username,
            email,
            salt,
            hash,
            provider: "local"
        });
        await user.save();
        res.status(200).json({ status: true, message: "User is registered" });
    }
    catch (err) {
        res.json({ status: false, error: err });
    }
}
exports.register = register;
async function login(req, res) {
    const { email, password } = req.body;
    try {
        let user = await user_model_1.default.findOne({ email }).exec();
        if (!user)
            return res.status(400).json({ status: false, message: "Invalid email credential" });
        const isMatch = await crypt.comparePassword(password, user.hash);
        if (!isMatch)
            return res.status(400).json({ status: false, message: "Invalid password credential" });
        const accessToken = util.generateAccessToken(user._id);
        const refreshToken = await util.generateRefreshToken(user._id);
        const isSecure = process.env.NODE_ENV === "production";
        res
            .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: isSecure,
        })
            .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isSecure,
        })
            .status(200)
            .json({ status: true, message: "User logged in" });
    }
    catch (err) {
        res.json({ status: false, error: err });
    }
} // error logging in
exports.login = login;
async function logout(req, res) {
    try {
        await util.deleteTokens(req.user._id, req.token);
        res
            .clearCookie("accessToken")
            .clearCookie("refreshToken")
            .status(200)
            .json({ status: true, message: "User logged out" });
    }
    catch (err) {
        res.json({ status: false, error: err });
    }
}
exports.logout = logout;
async function generateTokens(req, res) {
    try {
        const id = req.user._id.toString();
        const accessToken = util.generateAccessToken(id);
        const refreshToken = await util.generateRefreshToken(id);
        const isSecure = process.env.NODE_ENV === "production";
        res
            .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: isSecure,
        })
            .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isSecure,
        })
            .status(200)
            .json({ status: true, message: "User's tokens regenerated" });
    }
    catch (err) {
        res.json({ status: false, error: err });
    }
}
exports.generateTokens = generateTokens;
