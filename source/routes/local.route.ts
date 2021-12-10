import { Router } from "express";
import { register, login, logout, generateTokens } from "../controllers/auth.controller";
import { verifyToken, verifyRefreshToken } from "../middlewares/verification.middleware";

const local: Router = Router();

local.post('/login', login);
local.post('/register', register);
local.get('/logout', verifyToken, logout);
local.post('/refresh', verifyRefreshToken, generateTokens);

export default local;