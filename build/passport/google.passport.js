"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_google_oauth20_1 = require("passport-google-oauth20");
const user_model_1 = __importDefault(require("../database/user.model"));
const googleStrategy = new passport_google_oauth20_1.Strategy({
    callbackURL: 'http://localhost:5000/google/redirect',
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
}, async (_, __, profile, done) => {
    try {
        const email = profile.emails[0].value;
        let user = await user_model_1.default.findOne({ email });
        if (!user) {
            user = await new user_model_1.default({
                email,
                username: profile.displayName,
                provider: profile.provider,
            }).save();
        }
        return done(null, user);
    }
    catch (err) {
        return done(err, null);
    }
});
exports.default = googleStrategy;
