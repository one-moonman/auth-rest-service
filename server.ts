import express from "express";
import morgan from "morgan";
import "dotenv/config";

import passport from "passport";
import connectDatabases from "./database/db.connect";
import googleStrategy from "./passport/google.passport";
import { getTokens, login, logout, register } from "./controllers/auth.controller";
import { verifyRefreshToken, verifyToken } from "./middlewares/verify.middleware";

import { IUser } from "./database/user.model";

declare module "express" {
    export interface Request {
        user: IUser;
        token: string;
    }
}

const app: express.Application = express();
app.use(morgan('dev'));
app.use(express.json());

app.use(passport.initialize());
passport.use(googleStrategy);

(async () => {
    await connectDatabases();
})()

app.post('/login', login);
app.post('/register', register);
app.get('/logout', verifyToken, logout);

app.post('/refresh', verifyRefreshToken, getTokens);

app.get('/dashboard', verifyToken, (req, res) => {
    const user = req.user;
    res.json({ user });
});


app.get('/google',
    passport.authenticate('google', <any>{
        session: false,
        scope: ['profile', 'email'],
        accessType: 'offline',
        prompt: 'consent',
    }));
app.get('/google/redirect',
    passport.authenticate('google', { session: false }), getTokens
);


app.listen(5000, () =>
    console.log(`[server] listening at 5000`)
)
