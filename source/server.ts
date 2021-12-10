import express from "express";
import morgan from "morgan";
import "dotenv/config";

import passport from "passport";
import connectDatabases from "./database/db.connect";
import googleStrategy from "./passport/google.passport";
import { verifyToken } from "./middlewares/verification.middleware";

import { IUser } from "./database/user.model";

import cookieParser from "cookie-parser";

import local from "./routes/local.route";
import social from "./routes/social.route";

import helmet from "helmet";
import fs from "fs";
import path from "path";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

declare module "express" {
    export interface Request {
        user: IUser;
        token: string;
    }
}
const app: express.Application = express();
app.use(morgan((() => {
    if (process.env.NODE_ENV === 'production')
        return 'combined'
    return 'dev'
})(), { stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' }) }));

app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
app.use(mongoSanitize());
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(passport.initialize());
passport.use(googleStrategy);

(async () => {
    await connectDatabases();
})()

app.use('/', local);
app.use('/social', social);

app.get('/dashboard', verifyToken, (req: express.Request, res: express.Response) => {
    const { username, email, provider } = req.user;
    res.status(200).send({ username, email, provider });
});

app.listen(5000, () =>
    console.log(`[server] listening at 5000`)
)
