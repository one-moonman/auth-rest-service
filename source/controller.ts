import { Request, Response } from "express";
import * as util from "./utils";
import userRepository from "./repository";

async function register(req: Request, res: Response) {
    try {
        const { username, email, password }: { username: string, email: string, password: string } = req.body;

        let user = await userRepository.findByEmail(email);
        if (user)
            return res.status(400).json({ status: false, message: "User already exists" });

        const { salt, hash }: { salt: string, hash: string } = await util.generatePassword(password);
        user = await userRepository.createNew({
            email,
            username,
            salt,
            hash,
            provider: "local"
        })
        res.status(200).json({ status: true, message: "User is registered" });
    } catch (err) {
        res.json({ status: false, error: err });
    }
}

async function login(req: Request, res: Response) {
    try {
        const { email, password }: { email: string, password: string } = req.body;

        let user = await userRepository.findByEmail(email);
        if (!user)
            return res.status(400).json({ status: false, message: "Invalid email credential" });

        const isMatch: boolean = await util.comparePassword(password, user.hash);
        if (!isMatch)
            return res.status(400).json({ status: false, message: "Invalid password credential" });

        const accessToken: string = util.generateAccessToken(user.id);
        const refreshToken: string = await util.generateRefreshToken(user.id);

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


async function logout(req: Request, res: Response) {
    try {
        await util.deleteTokens(req.user.id, req.token);
        res
            .clearCookie("accessToken")
            .clearCookie("refreshToken")
            .status(200)
            .json({ status: true, message: "User logged out" });
    } catch (err) {
        res.json({ status: false, error: err });
    }
}

async function generateTokens(req: Request, res: Response) {
    try {
        const accessToken: string = util.generateAccessToken(req.user.id);
        const refreshToken: string = await util.generateRefreshToken(req.user.id);

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

export default { register, login, logout, generateTokens }