"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.generatePassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
async function generatePassword(password) {
    const salt = await bcrypt_1.default.genSalt(12);
    const hash = await bcrypt_1.default.hash(password, salt);
    return { salt, hash };
}
exports.generatePassword = generatePassword;
async function comparePassword(password, hash) {
    return await bcrypt_1.default.compare(password, hash);
}
exports.comparePassword = comparePassword;
