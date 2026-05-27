"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAccounts = exports.createAccount = void 0;
const account_model_1 = require("../models/account.model");
const createAccount = async (userId, data) => {
    return await account_model_1.Account.create({
        user_id: userId,
        ...data,
    });
};
exports.createAccount = createAccount;
const getUserAccounts = async (userId) => {
    return await account_model_1.Account.findAll({
        where: { user_id: userId },
        order: [["created_at", "DESC"]],
    });
};
exports.getUserAccounts = getUserAccounts;
