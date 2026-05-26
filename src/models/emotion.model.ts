import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BelongsToMany,
} from "sequelize-typescript";
import { Trade } from "./trade.model";
import { TradeEmotion } from "./trade-emotion.model";

@Table({ tableName: "emotions", underscored: true, timestamps: false })
export class Emotion extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.TEXT)
  declare name: string;

  @BelongsToMany(() => Trade, () => TradeEmotion)
  declare trades: Trade[];
}
