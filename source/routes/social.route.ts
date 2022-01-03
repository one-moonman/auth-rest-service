import { Router } from "express";
import passport from "passport";
import googleStrategy from "../passport/google.passport";
import authController from "../controller";

const social: Router = Router();
social.use(passport.initialize());
passport.use(googleStrategy);

const google: Router = Router();
social.use('/google', google);

google.get('/',
    passport.authenticate('google',
        <any>{ session: false, scope: ['profile', 'email'], accessType: 'offline', prompt: 'consent', }
    )
);
google.get('/redirect',
    passport.authenticate('google',
        { session: false }),
    authController.generateTokens
);

export default social;