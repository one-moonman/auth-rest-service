import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import UserModel, { IUser } from "../database/user.model";

const googleStrategy: GoogleStrategy = new GoogleStrategy(
    {
        callbackURL: 'http://localhost:5000/google/redirect',
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    async (_, __, profile: Profile, done: VerifyCallback) => {
        try {
            const email: string = profile.emails[0].value;
            let user: IUser = await UserModel.findOne({ email });
            if (!user) {
                user = await new UserModel({
                    email,
                    username: profile.displayName,
                    provider: profile.provider,
                }).save();
            }
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
);

export default googleStrategy;