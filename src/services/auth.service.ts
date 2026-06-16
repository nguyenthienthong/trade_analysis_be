import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

const generateTokens = (user: User) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
  
  return { accessToken, refreshToken };
};

export const register = async (email: string, password: string) => {
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password_hash: hashed });
  
  const tokens = generateTokens(user);
  user.refresh_token = tokens.refreshToken;
  await user.save();

  return { user, tokens };
};

export const login = async (email: string, password: string) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error("Invalid password");

  const tokens = generateTokens(user);
  user.refresh_token = tokens.refreshToken;
  await user.save();

  return tokens;
};

export const refreshToken = async (token: string) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const user = await User.findByPk(payload.id);
    
    if (!user || user.refresh_token !== token) {
      throw new Error("Invalid refresh token");
    }

    const tokens = generateTokens(user);
    user.refresh_token = tokens.refreshToken;
    await user.save();

    return tokens;
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};
