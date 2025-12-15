import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.register(
      req.body.email,
      req.body.password
    );
    res.status(201).json(user);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const token = await authService.login(
      req.body.email,
      req.body.password
    );
    res.json({ token });
  } catch (e: any) {
    res.status(401).json({ message: e.message });
  }
};
