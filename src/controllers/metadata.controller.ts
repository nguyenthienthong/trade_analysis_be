import { Request, Response } from "express";
import { Emotion } from "../models/emotion.model";
import { Tag } from "../models/tag.model";
import { TradeSetup } from "../models/trade-setup.model";

export const getMetadata = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    let emotions = await Emotion.findAll();
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
      await Emotion.bulkCreate(defaultEmotions.map((name) => ({ name })));
      emotions = await Emotion.findAll();
    }

    let tags = await Tag.findAll({ where: { userId } });
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
      await Tag.bulkCreate(defaultTags.map((name) => ({ name, userId })));
      tags = await Tag.findAll({ where: { userId } });
    }

    let setups = await TradeSetup.findAll({ where: { userId } });
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
      await TradeSetup.bulkCreate(defaultSetups);
      setups = await TradeSetup.findAll({ where: { userId } });
    }

    res.status(200).json({ emotions, tags, setups });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;
    const { name } = req.body;
    const tag = await Tag.create({ name, userId });
    res.status(201).json(tag);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const createSetup = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;
    const { name, description } = req.body;
    const setup = await TradeSetup.create({ name, description, userId });
    res.status(201).json(setup);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const createEmotion = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    // Emotion is global, no userId needed currently in the model.
    const emotion = await Emotion.create({ name });
    res.status(201).json(emotion);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};
