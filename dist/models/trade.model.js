"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trade = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const trade_setup_model_1 = require("./trade-setup.model");
const emotion_model_1 = require("./emotion.model");
const tag_model_1 = require("./tag.model");
const trade_emotion_model_1 = require("./trade-emotion.model");
const trade_tag_model_1 = require("./trade-tag.model");
const trade_image_model_1 = require("./trade-image.model");
let Trade = class Trade extends sequelize_typescript_1.Model {
};
exports.Trade = Trade;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Trade.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Trade.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Trade.prototype, "accountId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Trade.prototype, "symbol", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Trade.prototype, "side", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(18, 8)),
    __metadata("design:type", String)
], Trade.prototype, "entryPrice", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(18, 8)),
    __metadata("design:type", Object)
], Trade.prototype, "exitPrice", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(18, 8)),
    __metadata("design:type", String)
], Trade.prototype, "quantity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(18, 8)),
    __metadata("design:type", String)
], Trade.prototype, "pnl", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(18, 8)),
    __metadata("design:type", String)
], Trade.prototype, "fee", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(5, 2)),
    __metadata("design:type", Object)
], Trade.prototype, "rr", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Trade.prototype, "openTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Object)
], Trade.prototype, "closeTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Object)
], Trade.prototype, "durationMinutes", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => trade_setup_model_1.TradeSetup),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", Object)
], Trade.prototype, "setupId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", Object)
], Trade.prototype, "note", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => trade_setup_model_1.TradeSetup, 'setupId'),
    __metadata("design:type", trade_setup_model_1.TradeSetup)
], Trade.prototype, "setup", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => emotion_model_1.Emotion, () => trade_emotion_model_1.TradeEmotion),
    __metadata("design:type", Array)
], Trade.prototype, "emotions", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => tag_model_1.Tag, () => trade_tag_model_1.TradeTag),
    __metadata("design:type", Array)
], Trade.prototype, "tags", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => trade_image_model_1.TradeImage),
    __metadata("design:type", Array)
], Trade.prototype, "images", void 0);
exports.Trade = Trade = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "trades", underscored: true, timestamps: false })
], Trade);
