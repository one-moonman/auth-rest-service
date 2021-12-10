import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel, { IUser } from "../database/user.model";

import { redisClient } from "../database/db.connect";

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
        const token: string = req.cookies.accessToken;
        const decodedToken: string | jwt.JwtPayload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user: IUser = await UserModel.findById((<IUser>decodedToken)._id);
        if (!user)
            return res.status(404).json({ status: false, message: "User not found" });

        const blacklisted: string = await redisClient.get('BL_' + user._id);
        if (token === blacklisted)
            return res.status(401).json({ status: false, message: "Blacklisted token" });

        req.user = user;
        req.token = token;

        next();
    } catch (err) {
        res.json({ status: false, error: err });
    }
}

export async function verifyRefreshToken(req: Request, res: Response, next: NextFunction) {
    try {
        const token: string = req.cookies.refreshToken;

        if (!token)
            return res.status(401).json({ status: false, message: "No token provided" });

        const decodedToken: string | jwt.JwtPayload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        const user: IUser = await UserModel.findById((<IUser>decodedToken)._id);
        if (!user)
            res.status(404).json({ status: false, message: "User not found" });

        const memory: string = await redisClient.get(user.id);
        if (!memory)
            return res.status(401).json({ status: false, message: "Token is not in store." });

        if (JSON.parse(memory).token !== token)
            return res.status(401).json({ status: false, message: "Token is not same in store." });

        req.user = user;

        next();
    } catch (err) {
        res.json({ status: false, error: err });
    }
}