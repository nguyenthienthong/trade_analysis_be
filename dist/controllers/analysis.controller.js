"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBehaviorFlow = exports.getBehavioralAnalysis = exports.getErrorDetection = exports.getAdvancedAnalytics = exports.getEquityCurve = exports.getStatsOverview = void 0;
const analysisService = __importStar(require("../services/analysis.service"));
const getStatsOverview = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const stats = await analysisService.getStatsOverview(userId);
        res.status(200).json(stats);
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};
exports.getStatsOverview = getStatsOverview;
const getEquityCurve = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const equityData = await analysisService.getEquityCurve(userId);
        res.status(200).json(equityData);
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};
exports.getEquityCurve = getEquityCurve;
const getAdvancedAnalytics = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { startDate, endDate } = req.query;
        const advancedData = await analysisService.getAdvancedAnalytics(userId, startDate, endDate);
        res.status(200).json(advancedData);
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};
exports.getAdvancedAnalytics = getAdvancedAnalytics;
const getErrorDetection = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const errorsData = await analysisService.getErrorDetection(userId);
        res.status(200).json(errorsData);
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};
exports.getErrorDetection = getErrorDetection;
const getBehavioralAnalysis = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { startDate, endDate } = req.query;
        const behavioralData = await analysisService.getBehavioralAnalysis(userId, startDate, endDate);
        res.status(200).json(behavioralData);
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};
exports.getBehavioralAnalysis = getBehavioralAnalysis;
const getBehaviorFlow = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { startDate, endDate } = req.query;
        const flowData = await analysisService.getBehaviorFlow(userId, startDate, endDate);
        res.status(200).json(flowData);
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};
exports.getBehaviorFlow = getBehaviorFlow;
