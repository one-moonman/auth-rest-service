import { Router } from "express";
import controller from "../controller";
import verify from "../middleware";

const local: Router = Router();

local.post('/login', controller.login);
local.post('/register', controller.register);
local.get('/logout', verify.verifyToken, controller.logout);
local.post('/refresh', verify.verifyRefreshToken, controller.generateTokens);

export default local;