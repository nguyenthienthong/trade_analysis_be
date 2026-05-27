"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.default = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return res.sendStatus(401);
    try {
        req.user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        next();
    }
    catch {
        res.sendStatus(403);
    }
};
