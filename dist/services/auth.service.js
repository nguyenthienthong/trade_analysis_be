"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const register = async (email, password) => {
    const hashed = await bcrypt_1.default.hash(password, 10);
    return user_model_1.User.create({ email, password_hash: hashed });
};
exports.register = register;
const login = async (email, password) => {
    const user = await user_model_1.User.findOne({ where: { email } });
    if (!user)
        throw new Error("User not found");
    const valid = await bcrypt_1.default.compare(password, user.password_hash);
    if (!valid)
        throw new Error("Invalid password");
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
exports.login = login;
