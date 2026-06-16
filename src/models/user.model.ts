import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  IsEmail,
  Unique,
  CreatedAt,
} from "sequelize-typescript";

@Table({ tableName: "users", underscored: true, timestamps: true })
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @IsEmail
  @Column(DataType.TEXT)
  email!: string;

  @Column(DataType.TEXT)
  password_hash!: string;

  @Default("free")
  @Column(DataType.TEXT)
  plan!: string;

  @Column(DataType.TEXT)
  refresh_token!: string;

  @CreatedAt
  created_at!: Date;
}
