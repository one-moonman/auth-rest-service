import jwt from "jsonwebtoken";
import { redisClient } from "../database/db.connect";

export function generateAccessToken(userId: string): string {
    const token: string = jwt.sign(
        { _id: userId },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_AGE,
        }
    )
    return token;
}

export async function generateRefreshToken(userId: string): Promise<string> {
    const token: string = jwt.sign(
        { _id: userId },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_AGE,
        }
    );

    await redisClient.set(userId, JSON.stringify({
        refreshToken: token,
        expiresIn: process.env.REFRESH_TOKEN_AGE
    }));

    return token;

}

export async function deleteTokens(userId: string, token: string): Promise<void> {
    try {
        await redisClient.del(userId);
        await redisClient.set('BL_' + userId, token);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}