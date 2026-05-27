"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const metadata_controller_1 = require("../controllers/metadata.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.default, metadata_controller_1.getMetadata);
router.post("/tags", auth_middleware_1.default, metadata_controller_1.createTag);
router.post("/setups", auth_middleware_1.default, metadata_controller_1.createSetup);
router.post("/emotions", auth_middleware_1.default, metadata_controller_1.createEmotion);
exports.default = router;
