import { parse } from "csv-parse/sync";
import fs from "fs";
import { Trade } from "../models/trade.model";

export const importBinanceCsv = async (
  filePath: string,
  userId: string,
  accountId: string
) => {
  const csv = fs.readFileSync(filePath);

  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
  });

  const trades = rows.map((row: any) => ({
    userId,
    accountId,

    symbol: row["Pair"],
    side: row["Side"],

    entryPrice: row["Price"],
    exitPrice: null,

    quantity: row["Executed"],

    pnl: row["Realized PnL"] || 0,
    fee: row["Fee"] || 0,

    rr: null,

    openTime: new Date(row["Date(UTC)"]),
    closeTime: null,
    durationMinutes: null,

    setupId: null,
    note: "Imported from Binance CSV",
  }));

  await Trade.bulkCreate(trades);
};

export const parseBinanceCsv = (filePath: string) => {
  const csv = fs.readFileSync(filePath);

  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
  });

  return rows.map((row: any) => ({
    symbol: row["Pair"],
    side: row["Side"],
    entryPrice: row["Price"],
    quantity: row["Executed"],
    fee: row["Fee"] || 0,
    pnl: row["Realized PnL"] || 0,
    openTime: row["Date(UTC)"],
  }));
};
