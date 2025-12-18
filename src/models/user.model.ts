import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default
} from "sequelize-typescript";

@Table({ tableName: "users" })
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  password_hash!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  })
  created_at!: Date;
}
