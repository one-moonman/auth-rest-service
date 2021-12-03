import { Request, Response } from "express";
import bcrypt from "bcrypt";

import * as util from "../utilities/jwt.utilities";

import UserModel, { IUser } from "../database/user.model";

export async function register(req: Request, res: Response) {
    const { username, email, password }: { username: string, email: string, password: string } = req.body;
    try {
        let user: IUser = await UserModel.findOne({ email }).exec();
        if (user) return res.status(400).send("User already exists");
        const hash: string = await bcrypt.hash(password, 12);
        user = new UserModel({ username, email, password: hash, provider: "local" })
        const newUser: IUser = await user.save();
        res.send(newUser);
    } catch (err) {
        res.send(err);
    }
}

export async function login(req: Request, res: Response) {
    const { email, password }: { email: string, password: string } = req.body;
    try {
        let user: IUser = await UserModel.findOne({ email }).exec();
        if (!user)
            return res.status(400).send("Invalid Email Credential");

        const isMatch: boolean = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).send("Invalid Password Credential");

        const accessToken: string = util.generateAccessToken(user._id);
        const refreshToken: string = await util.generateRefreshToken(user._id.toString());

        res
            .header('Authorization', 'Bearer ' + accessToken)
            .json({ accessToken, refreshToken });
    } catch (err) {
        res.send(err);
    }
}


export async function logout(req: Request, res: Response) {
    try {
        await util.deleteTokens(req.user.id, req.token)
        return res.send("Tokens Deleted");
    } catch (err) {
        res.send(err);
    }
}

export async function getTokens(req: Request, res: Response) {
    try {
        const id: string = req.user.id.toString();
        const accessToken: string = util.generateAccessToken(id);
        const refreshToken: string = await util.generateRefreshToken(id);
        res.json({ accessToken, refreshToken });
    } catch (err) {
        res.send(err);
    }
}
