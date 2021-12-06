import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel, { IUser } from "../database/user.model";

import { redisClient } from "../database/db.connect";

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
        const token: string = req.headers.authorization.split(' ')[1];
        const decodedToken: string | jwt.JwtPayload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user: IUser = await UserModel.findById((<IUser>decodedToken)._id);
        if (!user)
            return res.status(400).json({ status: false, message: "User not found" });

        const blacklisted: string = await redisClient.get('BL_' + user._id);
        if (token === blacklisted)
            return res.status(401).json({ status: false, message: "Blacklisted token" });

        req.user = user;
        req.token = token;

        next();
    } catch (err) {
        return res.status(401).json({ status: false, message: "Your token is not valid.", data: err });
    }
}

export async function verifyRefreshToken(req: Request, res: Response, next: NextFunction) {
    try {
        const token: string = req.headers.authorization.split(' ')[1];

        if (!token)
            return res.status(401).json({ error: "Unauthorized, Access Denied. No token provided" });

        const decodedToken: string | jwt.JwtPayload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        const user: IUser = await UserModel.findById((<IUser>decodedToken)._id);
        if (!user)
            res.status(400).json({ status: false, message: "User not found" });

        const mem: string = await redisClient.get(user.id);
        if (!mem)
            return res.status(401).json({ message: "Invalid request. Token is not in store." });

        if (JSON.parse(mem).token !== token)
            return res.status(401).json({ message: "Invalid request. Token is not same in store." });

        req.user = user;
        next();

    } catch (err) {
        console.error(err)
        return res.status(401).json({ status: false, message: "Your token is not valid.", data: err });
    }
}