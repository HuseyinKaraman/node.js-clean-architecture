import dotenv from 'dotenv';
dotenv.config();

export const DB_CONNECTION = process.env.DB_CONNECTION as string;
export const NODE_ENV = process.env.NODE_ENV as string;
export const PORT = process.env.PORT as string;