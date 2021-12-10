import { Router } from "express";
import passport from "passport";

import { generateTokens } from "../controllers/auth.controller";

const social: Router = Router();

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
    generateTokens
);

export default social;