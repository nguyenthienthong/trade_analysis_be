import { Request, Response } from "express";
import * as analysisService from "../services/analysis.service";

export const getStatsOverview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const stats = await analysisService.getStatsOverview(userId);
    res.status(200).json(stats);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const getEquityCurve = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const equityData = await analysisService.getEquityCurve(userId);
    res.status(200).json(equityData);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const getAdvancedAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { startDate, endDate } = req.query;
    
    const advancedData = await analysisService.getAdvancedAnalytics(
      userId, 
      startDate as string, 
      endDate as string
    );
    res.status(200).json(advancedData);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const getErrorDetection = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const errorsData = await analysisService.getErrorDetection(userId);
    res.status(200).json(errorsData);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const getBehavioralAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { startDate, endDate } = req.query;
    
    const behavioralData = await analysisService.getBehavioralAnalysis(
      userId, 
      startDate as string, 
      endDate as string
    );
    res.status(200).json(behavioralData);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const getBehaviorFlow = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { startDate, endDate } = req.query;
    
    const flowData = await analysisService.getBehaviorFlow(
      userId, 
      startDate as string, 
      endDate as string
    );
    res.status(200).json(flowData);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};
