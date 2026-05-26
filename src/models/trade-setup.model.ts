import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import { User } from "./user.model";
import { Trade } from "./trade.model";

@Table({ tableName: "trade_setups", underscored: true, timestamps: false })
export class TradeSetup extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column(DataType.TEXT)
  declare name: string;

  @Column(DataType.TEXT)
  declare description: string;

  @HasMany(() => Trade)
  declare trades: Trade[];
}
