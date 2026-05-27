"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ai_controller_1 = require("../controllers/ai.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const router = express_1.default.Router();
router.post("/analyze", auth_middleware_1.default, ai_controller_1.analyzeTrade);
router.post("/chat", auth_middleware_1.default, ai_controller_1.chat);
exports.default = router;
