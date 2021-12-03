import mongoose from "mongoose";
import { createClient } from "redis";

export const redisClient = createClient();

export default async function connectDatabases() {
    try {

        await mongoose.connect(process.env.MONGO_URL);
        console.log("[database] mongoose connected")

        await redisClient.connect();
        console.log("[database] redis connected")

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

