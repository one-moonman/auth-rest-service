"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
require("dotenv/config");
const passport_1 = __importDefault(require("passport"));
const db_connect_1 = __importDefault(require("./database/db.connect"));
const google_passport_1 = __importDefault(require("./passport/google.passport"));
const verification_middleware_1 = require("./middlewares/verification.middleware");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const local_route_1 = __importDefault(require("./routes/local.route"));
const social_route_1 = __importDefault(require("./routes/social.route"));
const app = (0, express_1.default)();
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(passport_1.default.initialize());
passport_1.default.use(google_passport_1.default);
(async () => {
    await (0, db_connect_1.default)();
})();
app.use('/', local_route_1.default);
app.use('/social', social_route_1.default);
app.get('/dashboard', verification_middleware_1.verifyToken, (req, res) => {
    const { username, email, provider } = req.user;
    res.status(200).send({ username, email, provider });
});
app.listen(5000, () => console.log(`[server] listening at 5000`));
