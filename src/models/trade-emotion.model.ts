import { Table, Column, Model, DataType, ForeignKey, PrimaryKey } from "sequelize-typescript";
import { Trade } from "./trade.model";
import { Emotion } from "./emotion.model";

@Table({ tableName: "trade_emotions", underscored: true, timestamps: false })
export class TradeEmotion extends Model {
  @PrimaryKey
  @ForeignKey(() => Trade)
  @Column(DataType.UUID)
  declare tradeId: string;

  @PrimaryKey
  @ForeignKey(() => Emotion)
  @Column(DataType.UUID)
  declare emotionId: string;
}
