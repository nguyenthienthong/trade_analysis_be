import { Account } from "../models/account.model";
import { Trade } from "../models/trade.model";

interface CreateAccountDto {
  name: string;
  exchange: string;
  type: string;
  is_default?: boolean;
}

export const createAccount = async (userId: string, data: CreateAccountDto) => {
  if (data.is_default) {
    // Set all other accounts of this user to not default
    await Account.update(
      { is_default: false },
      { where: { user_id: userId } }
    );
  }
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

export const setDefaultAccount = async (userId: string, accountId: string) => {
  const account = await Account.findOne({ where: { id: accountId, user_id: userId } });
  if (!account) throw new Error("Account not found");

  // Set all other accounts to not default
  await Account.update(
    { is_default: false },
    { where: { user_id: userId } }
  );

  account.is_default = true;
  await account.save();

  return account;
};

export const deleteAccount = async (userId: string, accountId: string) => {
  const account = await Account.findOne({ where: { id: accountId, user_id: userId } });
  if (!account) throw new Error("Account not found");

  // Cascade delete trades belonging to this account
  await Trade.destroy({ where: { accountId } });

  await account.destroy();
  return { success: true };
};

