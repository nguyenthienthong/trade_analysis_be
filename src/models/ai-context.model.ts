import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "./user.model";

@Table({
  tableName: "ai_contexts",
  timestamps: true,
})
export class AIContext extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: "chat, profile, market_event",
  })
  type!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content!: string;

  // We define vector size 768 for Google Gemini embeddings
  @Column({
    type: DataType.ARRAY(DataType.FLOAT), // Sequelize will use pgvector's type if registered
    allowNull: true,
  })
  embedding?: number[];
}
