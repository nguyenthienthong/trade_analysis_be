import { Account } from "../models/account.model";

interface CreateAccountDto {
  name: string;
  exchange: string;
  type: string;
  is_default?: boolean;
}

export const createAccount = async (userId: string, data: CreateAccountDto) => {
  return await Account.create({
    user_id: userId,
    ...data,
  });
};

export const getUserAccounts = async (userId: string) => {
  return await Account.findAll({
    where: { user_id: userId },
    order: [["created_at", "DESC"]],
  });
};
