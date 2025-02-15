import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const generateAccessToken = ( userId: mongoose.Types.ObjectId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

const generateRefreshToken = (userId: mongoose.Types.ObjectId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

const verifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
};

const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);
};

export { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken };
