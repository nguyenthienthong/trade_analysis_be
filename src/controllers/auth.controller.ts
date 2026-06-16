import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const data = await authService.register(req.body.email, req.body.password);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const tokens = await authService.login(req.body.email, req.body.password);
    res.json(tokens);
  } catch (e: any) {
    res.status(401).json({ message: e.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new Error("No refresh token provided");
    
    const tokens = await authService.refreshToken(refreshToken);
    res.json(tokens);
  } catch (e: any) {
    res.status(401).json({ message: e.message });
  }
};
