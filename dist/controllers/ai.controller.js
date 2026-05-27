"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = exports.analyzeTrade = void 0;
const ai_service_1 = require("../services/ai.service");
const analyzeTrade = async (req, res) => {
    try {
        const input = req.body;
        // Basic validation
        if (!input.symbol || input.price === undefined) {
            return res.status(400).json({ success: false, message: "Missing required fields: symbol, price" });
        }
        const analysis = await (0, ai_service_1.analyzeTradeContext)(input);
        res.json({
            success: true,
            data: analysis
        });
    }
    catch (error) {
        console.error("Controller Error in analyzeTrade:", error);
        res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};
exports.analyzeTrade = analyzeTrade;
const chat = async (req, res) => {
    try {
        const { message, symbol, isWeeklyReview } = req.body;
        // Assuming userId is available via auth middleware
        const userId = req.user?.id || "anonymous";
        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }
        const stream = await (0, ai_service_1.streamAIChat)(userId, message, symbol, isWeeklyReview);
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Transfer-Encoding", "chunked");
        for await (const chunk of stream) {
            res.write(chunk.text);
        }
        res.end();
    }
    catch (error) {
        console.error("Controller Error in chat stream:", error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message || "Internal server error" });
        }
        else {
            res.end();
        }
    }
};
exports.chat = chat;
