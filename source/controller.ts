import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

import * as util from "./utils";
import userRepository from "./repository";

async function register(req: Request, res: Response, next: NextFunction) {
    const { username, email, password }: { username: string, email: string, password: string } = req.body;

    let user = await userRepository.findByEmail(email);
    if (user)
        return next(createHttpError(400, "User with this email already Exist"))

    const { salt, hash }: { salt: string, hash: string } = await util.generatePassword(password);
    user = await userRepository.createNew({
        email,
        username,
        salt,
        hash,
        provider: "local"
    })
    return res.status(200).json({ status: true, message: "User is registered" });
}

async function login(req: Request, res: Response, next: NextFunction) {
    const { email, password }: { email: string, password: string } = req.body;

    let user = await userRepository.findByEmail(email);
    if (!user)
        return next(createHttpError(400, "Invalid email credential"))

    const isMatch: boolean = await util.comparePassword(password, user.hash);
    if (!isMatch)
        return next(createHttpError(400, "Invalid password credential"))

    const accessToken: string = util.generateAccessToken(user.id);
    const refreshToken: string = await util.generateRefreshToken(user.id);

    const isSecure: boolean = process.env.NODE_ENV === "production";
    return res
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
}


async function logout(req: Request, res: Response) {
    await util.deleteTokens(req.user.id, req.token);
    res
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .status(200)
        .json({ status: true, message: "User logged out" });
}

async function generateTokens(req: Request, res: Response) {
    const accessToken: string = util.generateAccessToken(req.user.id);
    const refreshToken: string = await util.generateRefreshToken(req.user.id);

    const isSecure: boolean = process.env.NODE_ENV === "production";
    return res
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

}

export default { register, login, logout, generateTokens }