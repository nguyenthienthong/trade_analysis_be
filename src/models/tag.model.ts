import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, BelongsToMany } from "sequelize-typescript";
import { User } from "./user.model";
import { Trade } from "./trade.model";
import { TradeTag } from "./trade-tag.model";

@Table({ tableName: "tags", underscored: true, timestamps: false })
export class Tag extends Model {
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

  @BelongsToMany(() => Trade, () => TradeTag)
  declare trades: Trade[];
}
