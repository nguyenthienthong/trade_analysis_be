import { parse } from "csv-parse/sync";
import fs from "fs";
import { Trade } from "../models/trade.model";

interface Position {
  symbol: string;
  side: "BUY" | "SELL";
  entryPrice: number;
  totalCost: number;
  quantity: number;
  openTime: Date;
  fee: number;
  pnl: number;
}

const getRowValue = (row: any, patterns: RegExp[]): string => {
  const keys = Object.keys(row);
  for (const pattern of patterns) {
    const matchingKey = keys.find(k => pattern.test(k));
    if (matchingKey !== undefined) {
      return String(row[matchingKey]).trim();
    }
  }
  return "";
};

const cleanSymbol = (sym: string): string => {
  if (!sym) return "";
  return sym
    .replace(/\.P$/, "")
    .replace(/-SWAP$/, "")
    .replace(/[-_]/g, "")
    .toUpperCase();
};

const parseFlexibleDate = (dateStr: string): Date => {
  if (!dateStr) return new Date("Invalid");

  // Format: YY-MM-DD HH:mm:ss
  const matchYY = dateStr.match(/^(\d{2})-(\d{2})-(\d{2})\s+(\d{2}:\d{2}:\d{2})/);
  if (matchYY) {
    return new Date(`20${matchYY[1]}-${matchYY[2]}-${matchYY[3]}T${matchYY[4]}Z`);
  }

  // Format: YYYY-MM-DD HH:mm:ss
  const matchYYYY = dateStr.match(/^(\d{4})[-/](\d{2})[-/](\d{2})\s+(\d{2}:\d{2}:\d{2})/);
  if (matchYYYY) {
    return new Date(`${matchYYYY[1]}-${matchYYYY[2]}-${matchYYYY[3]}T${matchYYYY[4]}Z`);
  }

  // Format: DD/MM/YYYY HH:mm:ss
  const matchDDMM = dateStr.match(/^(\d{2})[-/](\d{2})[-/](\d{4})\s+(\d{2}:\d{2}:\d{2})/);
  if (matchDDMM) {
    return new Date(`${matchDDMM[3]}-${matchDDMM[2]}-${matchDDMM[1]}T${matchDDMM[4]}Z`);
  }

  return new Date(dateStr);
};

export const buildTradesFromRows = (
  rows: any[],
  userId?: string,
  accountId?: string,
) => {
  const symbolPatterns = [/pair/i, /symbol/i, /market/i, /contract/i, /instrument/i];
  const sidePatterns = [/side/i, /direction/i, /type/i];
  const pricePatterns = [/avg.*price/i, /filled.*price/i, /price/i, /entry/i];
  const qtyPatterns = [/executed/i, /qty/i, /quantity/i, /amount/i, /size/i];
  const feePatterns = [/fee/i, /commission/i];
  const pnlPatterns = [/realized.*pnl/i, /realized.*p\&l/i, /closed.*pnl/i, /closed.*p\&l/i, /pnl/i, /p\&l/i, /profit/i];
  const timePatterns = [/date/i, /time/i, /timestamp/i];

  // Filter out invalid rows first
  const validRows = rows.filter((r) => {
    const timeStr = getRowValue(r, timePatterns);
    if (!timeStr) return false;
    const time = parseFlexibleDate(timeStr);
    return !isNaN(time.getTime());
  });

  // Sort rows chronologically (oldest first)
  const sortedRows = validRows.sort((a, b) => {
    const timeA = getRowValue(a, timePatterns);
    const timeB = getRowValue(b, timePatterns);
    return parseFlexibleDate(timeA).getTime() - parseFlexibleDate(timeB).getTime();
  });

  const activePositions: Record<string, Position> = {};
  const finishedTrades: any[] = [];

  for (const row of sortedRows) {
    const rawSymbol = getRowValue(row, symbolPatterns);
    const symbol = cleanSymbol(rawSymbol);
    const rawSide = getRowValue(row, sidePatterns);
    const side = rawSide.toUpperCase();
    const priceStr = getRowValue(row, pricePatterns) || "0";
    const executedStr = getRowValue(row, qtyPatterns) || "0";
    const feeStr = getRowValue(row, feePatterns) || "0";
    const pnlStr = getRowValue(row, pnlPatterns) || "0";
    const timeStr = getRowValue(row, timePatterns);

    if (!symbol || !side || !timeStr) continue;

    // Skip funding fee rows or other non-trade rows
    if (side !== "BUY" && side !== "SELL") continue;

    const price = parseFloat(priceStr.replace(/,/g, ""));
    const executed = parseFloat(executedStr.replace(/,/g, ""));

    let fee = 0;
    if (typeof feeStr === "string") {
      const feeMatch = feeStr.match(/-?[\d.]+/);
      if (feeMatch) fee = parseFloat(feeMatch[0]);
    } else {
      fee = parseFloat(feeStr);
    }

    fee = Math.abs(fee);

    const pnl = parseFloat(pnlStr.replace(/,/g, ""));
    const time = parseFlexibleDate(timeStr);

    if (!activePositions[symbol]) {
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

      pos.quantity -= executed;

      if (pos.quantity <= 0.000001) {
        // Position fully closed or reversed
        finishedTrades.push({
          userId: userId || null,
          accountId: accountId || null,
          symbol: pos.symbol,
          side: pos.side === "BUY" ? "long" : "short",
          entryPrice: pos.entryPrice,
          exitPrice: price,
          quantity: pos.totalCost / pos.entryPrice,
          pnl: pos.pnl,
          fee: pos.fee,
          openTime: pos.openTime,
          closeTime: time,
          durationMinutes: Math.round(
            (time.getTime() - pos.openTime.getTime()) / 60000,
          ),
          note: "Imported via OKX Trade Builder",
        });

        const remainingQuantity = Math.abs(pos.quantity);
        delete activePositions[symbol];

        if (remainingQuantity > 0.000001) {
          activePositions[symbol] = {
            symbol,
            side: side as "BUY" | "SELL",
            entryPrice: price,
            totalCost: price * remainingQuantity,
            quantity: remainingQuantity,
            openTime: time,
            fee: 0,
            pnl: 0,
          };
        }
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
      note: "Open position imported from OKX",
    });
  }

  return finishedTrades;
};

export const importOkxCsv = async (
  filePath: string,
  userId: string,
  accountId: string,
) => {
  const csv = fs.readFileSync(filePath);

  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });

  const trades = buildTradesFromRows(rows, userId, accountId);

  await Trade.bulkCreate(trades);
};

export const parseOkxCsv = (filePath: string) => {
  const csv = fs.readFileSync(filePath);

  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });

  return buildTradesFromRows(rows);
};
