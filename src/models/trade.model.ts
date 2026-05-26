import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  BelongsTo,
  BelongsToMany,
  ForeignKey,
  HasMany,
} from "sequelize-typescript";
import { TradeSetup } from "./trade-setup.model";
import { Emotion } from "./emotion.model";
import { Tag } from "./tag.model";
import { TradeEmotion } from "./trade-emotion.model";
import { TradeTag } from "./trade-tag.model";
import { TradeImage } from "./trade-image.model";

@Table({ tableName: "trades", underscored: true, timestamps: false })
export class Trade extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.UUID)
  declare userId: string;

  @Column(DataType.UUID)
  declare accountId: string;

  @Column(DataType.STRING)
  declare symbol: string;

  @Column(DataType.STRING)
  declare side: "long" | "short";

  @Column(DataType.DECIMAL(18, 8))
  declare entryPrice: string;

  @Column(DataType.DECIMAL(18, 8))
  declare exitPrice: string | null;

  @Column(DataType.DECIMAL(18, 8))
  declare quantity: string;

  @Column(DataType.DECIMAL(18, 8))
  declare pnl: string;

  @Column(DataType.DECIMAL(18, 8))
  declare fee: string;

  @Column(DataType.DECIMAL(5, 2))
  declare rr: string | null;

  @Column(DataType.DATE)
  declare openTime: Date;

  @Column(DataType.DATE)
  declare closeTime: Date | null;

  @Column(DataType.INTEGER)
  declare durationMinutes: number | null;

  @ForeignKey(() => TradeSetup)
  @Column(DataType.UUID)
  declare setupId: string | null;

  @Column(DataType.TEXT)
  declare note: string | null;

  @BelongsTo(() => TradeSetup, 'setupId')
  declare setup: TradeSetup;

  @BelongsToMany(() => Emotion, () => TradeEmotion)
  declare emotions: Emotion[];

  @BelongsToMany(() => Tag, () => TradeTag)
  declare tags: Tag[];

  @HasMany(() => TradeImage)
  declare images: TradeImage[];
}
