"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const redis_1 = require("redis");
exports.redisClient = (0, redis_1.createClient)({ url: process.env.REDIS_URL });
async function connectDatabases() {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URL);
        console.log("[database] mongoose connected");
        await exports.redisClient.connect();
        console.log("[database] redis connected");
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}
exports.default = connectDatabases;
