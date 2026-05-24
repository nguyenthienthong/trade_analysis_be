import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./user.model";

@Table({ tableName: "daily_stats", underscored: true, timestamps: false })
export class DailyStat extends Model {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare userId: string;

  @PrimaryKey
  @Column(DataType.DATEONLY)
  declare date: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column(DataType.INTEGER)
  declare totalTrades: number;

  @Column(DataType.INTEGER)
  declare wins: number;

  @Column(DataType.INTEGER)
  declare losses: number;

  @Column(DataType.DECIMAL(18, 8))
  declare pnl: string;

  @Column(DataType.DECIMAL(18, 8))
  declare maxDrawdown: string;
}
