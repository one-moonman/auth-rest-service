import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { redisClient } from ".";

export async function generatePassword(password: string): Promise<{ salt: string, hash: string }> {
    try {
        const salt: string = await bcrypt.genSalt(12);
        const hash: string = await bcrypt.hash(password, salt);
        return { salt, hash };
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

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
    })).catch(err => {
        console.error(err);
        process.exit(1);
    });

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
