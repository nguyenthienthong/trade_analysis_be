import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Trade } from "./trade.model";

@Table({ tableName: "trade_images", underscored: true, timestamps: true })
export class TradeImage extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Trade)
  @Column(DataType.UUID)
  declare tradeId: string;

  @BelongsTo(() => Trade)
  declare trade: Trade;

  @Column(DataType.STRING)
  declare url: string;

  @Column(DataType.STRING)
  declare type: string; // 'before', 'after', 'general'
}
