import { Table, Column, Model, DataType, ForeignKey, PrimaryKey } from "sequelize-typescript";
import { Trade } from "./trade.model";
import { Tag } from "./tag.model";

@Table({ tableName: "trade_tags", underscored: true, timestamps: false })
export class TradeTag extends Model {
  @PrimaryKey
  @ForeignKey(() => Trade)
  @Column(DataType.UUID)
  declare tradeId: string;

  @PrimaryKey
  @ForeignKey(() => Tag)
  @Column(DataType.UUID)
  declare tagId: string;
}
