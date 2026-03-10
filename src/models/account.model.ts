import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./user.model";

@Table({ tableName: "accounts", underscored: true, timestamps: false })
export class Account extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  user_id!: string;

  @BelongsTo(() => User)
  user!: User;

  @Column(DataType.TEXT)
  name!: string;

  @Column(DataType.TEXT)
  exchange!: string; // binance, bybit

  @Column(DataType.TEXT)
  type!: string; // futures, spot

  @Default(false)
  @Column(DataType.BOOLEAN)
  isDefault!: boolean;

  @CreatedAt
  @Column(DataType.DATE) // Using DataType.DATE which maps to TIMESTAMP with timezone in Postgres by default usually, but let's stick to standard sequelizets
  created_at!: Date;
}
