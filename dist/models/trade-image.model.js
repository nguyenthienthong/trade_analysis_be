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
exports.TradeImage = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const trade_model_1 = require("./trade.model");
let TradeImage = class TradeImage extends sequelize_typescript_1.Model {
};
exports.TradeImage = TradeImage;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], TradeImage.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => trade_model_1.Trade),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], TradeImage.prototype, "tradeId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => trade_model_1.Trade),
    __metadata("design:type", trade_model_1.Trade)
], TradeImage.prototype, "trade", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], TradeImage.prototype, "url", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], TradeImage.prototype, "type", void 0);
exports.TradeImage = TradeImage = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "trade_images", underscored: true, timestamps: true })
], TradeImage);
