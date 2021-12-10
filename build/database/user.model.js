"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email is already registered"],
    },
    username: {
        type: String,
        required: true
    },
    hash: String,
    salt: String,
    provider: {
        type: String,
        required: [true, "Provider is not specified"]
    },
});
const UserModel = mongoose_1.default.model('users', schema);
exports.default = UserModel;
