import express from "express";
import "dotenv/config";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import verifyMiddleware from "./middleware";
import { User } from "@prisma/client";

import local from "./routes/local.route";
import social from "./routes/social.route";

import { createClient } from "redis";
export const redisClient = createClient({ url: process.env.REDIS_URL });
async function connectRedis() {
    try {
        await redisClient.connect();
        console.log("[database] redis connected")
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

declare module "express" {
    export interface Request {
        user: User;
        token: string;
    }
}

(async () => {
    const app: express.Application = express();

    app.use(morgan('dev'))
        .use(helmet())
        .use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
        .use(cookieParser())
        .use(express.json())
        .use(express.urlencoded({ extended: false }));

    await connectRedis();

    app.use('/', local)
        .use('/social', social)
        .get('/dashboard', verifyMiddleware.verifyToken, (req: express.Request, res: express.Response) => {
            const { email, username, provider } = req.user;
            res.status(200).send({ username, email, provider });
        });

    app.listen(process.env.PORT, () => console.log(`[server] listening at ${process.env.PORT}`))
})()
