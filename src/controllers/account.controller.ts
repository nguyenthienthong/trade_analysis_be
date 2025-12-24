import { Request, Response } from "express";
import * as accountService from "../services/account.service";

export const createAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const account = await accountService.createAccount(userId, req.body);
    res.status(201).json(account);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};
