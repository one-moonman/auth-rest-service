import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import userRepository from "./repository";
import { redisClient } from ".";

async function verifyToken(req: Request, _: Response, next: NextFunction) {
    const token: string = req.cookies.accessToken;
    const decodedToken: string | jwt.JwtPayload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await userRepository.findById((<any>decodedToken).id);
    if (!user)
        next(createHttpError(404, "User not found"));

    const blacklisted: string = await redisClient.get('BL_' + user.id);
    if (token === blacklisted)
        next(createHttpError(401, "Token is blacklisted"));

    req.user = user;
    req.token = token;

    next();

}

async function verifyRefreshToken(req: Request, _: Response, next: NextFunction) {
    const token: string = req.cookies.refreshToken;

    if (!token)
        return next(createHttpError(401, "No token is provided"));

    const decodedToken: string | jwt.JwtPayload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await userRepository.findById((<any>decodedToken).id);
    if (!user)
        return next(createHttpError(404, "User not found"));

    const fromMemory: string = await redisClient.get(user.id);
    if (!fromMemory)
        return next(createHttpError(401, "Token is not in store"));

    if (JSON.parse(fromMemory).refreshToken !== token)
        return next(createHttpError(401, "Token is not same in store."))

    req.user = user;

    return next();
}

export default { verifyToken, verifyRefreshToken };