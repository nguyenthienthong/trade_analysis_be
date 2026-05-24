import { parse } from "csv-parse/sync";
import fs from "fs";
import { Trade } from "../models/trade.model";

interface BinanceRow {
  "Date(UTC)": string;
  Pair: string;
  Side: "BUY" | "SELL";
  Price: string;
  Executed: string;
  Amount: string;
  Fee: string;
  "Realized PnL": string;
}

interface Position {
  symbol: string;
  side: "BUY" | "SELL";
  entryPrice: number;
  totalCost: number; // For average entry calculation
  quantity: number;
  openTime: Date;
  fee: number;
  pnl: number;
}

export const buildTradesFromRows = (rows: BinanceRow[], userId?: string, accountId?: string) => {
  // Sort rows chronologically (oldest first)
  const sortedRows = rows.sort(
    (a, b) => new Date(a["Date(UTC)"]).getTime() - new Date(b["Date(UTC)"]).getTime()
  );

  const activePositions: Record<string, Position> = {};
  const finishedTrades: any[] = [];

  for (const row of sortedRows) {
    const symbol = row.Pair;
    const side = row.Side;
    const price = parseFloat(row.Price);
    const executed = parseFloat(row.Executed);
    const fee = parseFloat(row.Fee || "0");
    const pnl = parseFloat(row["Realized PnL"] || "0");
    const time = new Date(row["Date(UTC)"]);

    if (!activePositions[symbol]) {
      // Open new position
      activePositions[symbol] = {
        symbol,
        side,
        entryPrice: price,
        totalCost: price * executed,
        quantity: executed,
        openTime: time,
        fee: fee,
        pnl: pnl,
      };
      continue;
    }

    const pos = activePositions[symbol];

    if (pos.side === side) {
      // DCA - Increase size
      pos.quantity += executed;
      pos.totalCost += price * executed;
      pos.entryPrice = pos.totalCost / pos.quantity;
      pos.fee += fee;
      pos.pnl += pnl;
    } else {
      // Opposite side - Closing (partial or full)
      pos.fee += fee;
      pos.pnl += pnl;

      // In Binance, if you sell more than your long position, it reverses.
      // For simplicity, we assume strict close.
      pos.quantity -= executed;

      if (pos.quantity <= 0.000001) { // Floating point precision check
        // Position fully closed
        finishedTrades.push({
          userId: userId || null,
          accountId: accountId || null,
          symbol: pos.symbol,
          side: pos.side === "BUY" ? "long" : "short",
          entryPrice: pos.entryPrice,
          exitPrice: price, // The last closing price
          quantity: pos.totalCost / pos.entryPrice, // Original total quantity
          pnl: pos.pnl,
          fee: pos.fee,
          openTime: pos.openTime,
          closeTime: time,
          durationMinutes: Math.round((time.getTime() - pos.openTime.getTime()) / 60000),
          note: "Imported via Binance Trade Builder",
        });

        // Remove from active positions
        delete activePositions[symbol];
      }
    }
  }

  // Handle remaining open positions
  for (const sym in activePositions) {
    const pos = activePositions[sym];
    finishedTrades.push({
      userId: userId || null,
      accountId: accountId || null,
      symbol: pos.symbol,
      side: pos.side === "BUY" ? "long" : "short",
      entryPrice: pos.entryPrice,
      exitPrice: null,
      quantity: pos.quantity,
      pnl: pos.pnl,
      fee: pos.fee,
      openTime: pos.openTime,
      closeTime: null,
      durationMinutes: null,
      note: "Open position imported from Binance",
    });
  }

  return finishedTrades;
};

export const importBinanceCsv = async (
  filePath: string,
  userId: string,
  accountId: string
) => {
  const csv = fs.readFileSync(filePath);

  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
  }) as BinanceRow[];

  const trades = buildTradesFromRows(rows, userId, accountId);

  await Trade.bulkCreate(trades);
};

export const parseBinanceCsv = (filePath: string) => {
  const csv = fs.readFileSync(filePath);

  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
  }) as BinanceRow[];

  return buildTradesFromRows(rows);
};
