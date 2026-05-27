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
  const parseBinanceDate = (dateStr: string): Date => {
    if (!dateStr) return new Date("Invalid");
    // Handle YY-MM-DD HH:mm:ss (often corrupted by Excel)
    const matchYY = dateStr.match(/^(\d{2})-(\d{2})-(\d{2})\s+(\d{2}:\d{2}:\d{2})/);
    if (matchYY) return new Date(`20${matchYY[1]}-${matchYY[2]}-${matchYY[3]}T${matchYY[4]}Z`);
    
    // Handle YYYY-MM-DD HH:mm:ss
    const matchYYYY = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}:\d{2}:\d{2})/);
    if (matchYYYY) return new Date(`${matchYYYY[1]}-${matchYYYY[2]}-${matchYYYY[3]}T${matchYYYY[4]}Z`);
    
    return new Date(dateStr);
  };

  // Filter out invalid rows first
  const validRows = rows.filter(r => {
    const timeStr = r["Date(UTC)"] || (r as any)["Time"] || (r as any)["Date"];
    if (!timeStr) return false;
    const time = parseBinanceDate(timeStr);
    return !isNaN(time.getTime());
  });

  // Sort rows chronologically (oldest first)
  const sortedRows = validRows.sort((a, b) => {
    const timeA = a["Date(UTC)"] || (a as any)["Time"] || (a as any)["Date"];
    const timeB = b["Date(UTC)"] || (b as any)["Time"] || (b as any)["Date"];
    return parseBinanceDate(timeA).getTime() - parseBinanceDate(timeB).getTime();
  });

  const activePositions: Record<string, Position> = {};
  const finishedTrades: any[] = [];

  for (const row of sortedRows) {
    const symbol = row.Pair || (row as any).Market || (row as any).Symbol;
    const rawSide = row.Side || (row as any).Type || "";
    const side = rawSide.toUpperCase();
    const priceStr = row.Price || "0";
    const executedStr = row.Executed || row.Amount || "0";
    const feeStr = row.Fee || "0";
    const pnlStr = row["Realized PnL"] || "0";
    const timeStr = row["Date(UTC)"] || (row as any)["Time"] || (row as any)["Date"];

    if (!symbol || !side || !timeStr) continue;

    const price = parseFloat(priceStr.replace(/,/g, ''));
    const executed = parseFloat(executedStr.replace(/,/g, ''));
    
    // Fee parsing logic: Binance Spot format often has fee as "0.123 BNB"
    let fee = 0;
    if (typeof feeStr === 'string') {
      const feeMatch = feeStr.match(/[\d.]+/);
      if (feeMatch) fee = parseFloat(feeMatch[0]);
    } else {
      fee = parseFloat(feeStr);
    }
    
    const pnl = parseFloat(pnlStr.replace(/,/g, ''));
    const time = parseBinanceDate(timeStr);

    if (!activePositions[symbol]) {
      // Open new position
      activePositions[symbol] = {
        symbol,
        side: side as "BUY" | "SELL",
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
    bom: true,
  }) as BinanceRow[];

  const trades = buildTradesFromRows(rows, userId, accountId);

  await Trade.bulkCreate(trades);
};

export const parseBinanceCsv = (filePath: string) => {
  const csv = fs.readFileSync(filePath);

  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  }) as BinanceRow[];

  return buildTradesFromRows(rows);
};
