"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const auth_controller_1 = require("../controllers/auth.controller");
const social = (0, express_1.Router)();
const google = (0, express_1.Router)();
social.use('/google', google);
google.get('/', passport_1.default.authenticate('google', { session: false, scope: ['profile', 'email'], accessType: 'offline', prompt: 'consent', }));
google.get('/redirect', passport_1.default.authenticate('google', { session: false }), auth_controller_1.generateTokens);
exports.default = social;
