"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const account_controller_1 = require("../controllers/account.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Account management API
 */
/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Create a new trading account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - exchange
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               exchange:
 *                 type: string
 *               type:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: The created account
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/", auth_middleware_1.default, account_controller_1.createAccount);
/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get all trading accounts of the user
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of connected accounts
 *       401:
 *         description: Unauthorized
 */
router.get("/", auth_middleware_1.default, account_controller_1.getUserAccounts);
exports.default = router;
