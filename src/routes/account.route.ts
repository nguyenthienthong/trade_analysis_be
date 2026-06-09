import { Router } from "express";
import {
  createAccount,
  getUserAccounts,
  setDefaultAccount,
  deleteAccount,
} from "../controllers/account.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

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
router.post("/", authMiddleware, createAccount);

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
router.get("/", authMiddleware, getUserAccounts);
router.patch("/:id/default", authMiddleware, setDefaultAccount);
router.delete("/:id", authMiddleware, deleteAccount);

export default router;
