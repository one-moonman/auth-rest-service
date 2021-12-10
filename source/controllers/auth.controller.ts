import { Request, Response } from "express";

import * as util from "../common/jwt.common";
import * as crypt from "../common/bcrypt.common";

import UserModel, { IUser } from "../database/user.model";

export async function register(req: Request, res: Response) {

    const { username, email, password }: { username: string, email: string, password: string } = req.body;

    try {
        let user: IUser = await UserModel.findOne({ email }).exec();
        if (user)
            return res.status(400).json({ status: false, message: "User already exists" });

        const { salt, hash }: { salt: string, hash: string } = await crypt.generatePassword(password);
        user = new UserModel({
            username,
            email,
            salt,
            hash,
            provider: "local"
        })
        await user.save();
        res.status(200).json({ status: true, message: "User is registered" });
    } catch (err) {
        res.json({ status: false, error: err });
    }
}

export async function login(req: Request, res: Response) {

    const { email, password }: { email: string, password: string } = req.body;

    try {
        let user: IUser = await UserModel.findOne({ email }).exec();
        if (!user)
            return res.status(400).json({ status: false, message: "Invalid email credential" });

        const isMatch: boolean = await crypt.comparePassword(password, user.hash);
        if (!isMatch)
            return res.status(400).json({ status: false, message: "Invalid password credential" });

        const id: string = user._id.toString();
        const accessToken: string = util.generateAccessToken(id);
        const refreshToken: string = await util.generateRefreshToken(id);

        const isSecure: boolean = process.env.NODE_ENV === "production";
        res
            .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: isSecure,
            })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: isSecure,
            })
            .status(200)
            .json({ status: true, message: "User logged in" });
    } catch (err) {
        res.json({ status: false, error: err });
    }
}


export async function logout(req: Request, res: Response) {
    try {
        await util.deleteTokens(req.user._id, req.token);
        res
            .clearCookie("accessToken")
            .clearCookie("refreshToken")
            .status(200)
            .json({ status: true, message: "User logged out" });
    } catch (err) {
        res.json({ status: false, error: err });
    }
}

export async function generateTokens(req: Request, res: Response) {
    try {
        const id: string = req.user._id.toString();
        const accessToken: string = util.generateAccessToken(id);
        const refreshToken: string = await util.generateRefreshToken(id);

        const isSecure: boolean = process.env.NODE_ENV === "production";
        res
            .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: isSecure,
            })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: isSecure,
            })
            .status(200)
            .json({ status: true, message: "User's tokens regenerated" });
    } catch (err) {
        res.json({ status: false, error: err });
    }
}
