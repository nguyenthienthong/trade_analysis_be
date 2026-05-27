"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmotion = exports.createSetup = exports.createTag = exports.getMetadata = void 0;
const emotion_model_1 = require("../models/emotion.model");
const tag_model_1 = require("../models/tag.model");
const trade_setup_model_1 = require("../models/trade-setup.model");
const getMetadata = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        let emotions = await emotion_model_1.Emotion.findAll();
        if (emotions.length === 0) {
            const defaultEmotions = [
                "FOMO",
                "Fear",
                "Greed",
                "Calm",
                "Confident",
                "Anxious",
                "Frustrated",
                "Revenge",
                "Excited",
                "Bored",
            ];
            await emotion_model_1.Emotion.bulkCreate(defaultEmotions.map((name) => ({ name })));
            emotions = await emotion_model_1.Emotion.findAll();
        }
        let tags = await tag_model_1.Tag.findAll({ where: { userId } });
        if (tags.length === 0) {
            const defaultTags = [
                "Overtrade",
                "Revenge Trade",
                "Followed Plan",
                "Early Exit",
                "Late Entry",
                "News Event",
                "Missed Setup",
            ];
            await tag_model_1.Tag.bulkCreate(defaultTags.map((name) => ({ name, userId })));
            tags = await tag_model_1.Tag.findAll({ where: { userId } });
        }
        let setups = await trade_setup_model_1.TradeSetup.findAll({ where: { userId } });
        if (setups.length === 0) {
            const defaultSetups = [
                {
                    name: "Breakout",
                    description: "Trading a break of support/resistance",
                    userId,
                },
                {
                    name: "Pullback",
                    description: "Entering on a retracement in a trend",
                    userId,
                },
                {
                    name: "Reversal",
                    description: "Trading against the main trend at a key level",
                    userId,
                },
                {
                    name: "Scalp",
                    description: "Quick in-and-out trade for small profits",
                    userId,
                },
            ];
            await trade_setup_model_1.TradeSetup.bulkCreate(defaultSetups);
            setups = await trade_setup_model_1.TradeSetup.findAll({ where: { userId } });
        }
        res.status(200).json({ emotions, tags, setups });
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};
exports.getMetadata = getMetadata;
const createTag = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const { name } = req.body;
        const tag = await tag_model_1.Tag.create({ name, userId });
        res.status(201).json(tag);
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};
exports.createTag = createTag;
const createSetup = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const { name, description } = req.body;
        const setup = await trade_setup_model_1.TradeSetup.create({ name, description, userId });
        res.status(201).json(setup);
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};
exports.createSetup = createSetup;
const createEmotion = async (req, res) => {
    try {
        const { name } = req.body;
        // Emotion is global, no userId needed currently in the model.
        const emotion = await emotion_model_1.Emotion.create({ name });
        res.status(201).json(emotion);
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};
exports.createEmotion = createEmotion;
