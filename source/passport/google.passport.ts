import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import userRepository from "../repository";

const googleStrategy: GoogleStrategy = new GoogleStrategy(
    {
        callbackURL: 'http://localhost:5000/social/google/redirect',
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    async (_, __, profile: Profile, done: VerifyCallback) => {
        try {
            const email: string = profile.emails[0].value;
            let user = await userRepository.findByEmail(email);
            if (!user) {
                user = await userRepository.createNew({
                    email,
                    username: profile.displayName,
                    provider: profile.provider,
                });
            }
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
);

export default googleStrategy;