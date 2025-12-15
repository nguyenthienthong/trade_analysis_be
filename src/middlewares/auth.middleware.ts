import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Table, Model, PrimaryKey, Default, DataType, Column } from "sequelize-typescript";

export interface AuthRequest extends Request {
  user?: any;
}

export default (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string);
    next();
  } catch {
    res.sendStatus(403);
  }
};@Table({ tableName: "users" })
export class User extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string;

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
    password!: string;
}

