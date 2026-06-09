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

export const getUserAccounts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const accounts = await accountService.getUserAccounts(userId);
    res.status(200).json({ data: accounts });
  } catch (e: any) {
    console.log(e);

    res.status(400).json({ message: e.message });
  }
};

export const setDefaultAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const account = await accountService.setDefaultAccount(userId, id);
    res.status(200).json(account);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const result = await accountService.deleteAccount(userId, id);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

