import mongoose from 'mongoose';
import { DB_CONNECTION } from '../../../../constants/environment';

let connection: typeof mongoose;

export const connectDB = async (): Promise<typeof mongoose> => {
  if (!connection) {
    const mongoUri = DB_CONNECTION;
    connection = await mongoose.connect(mongoUri);
  }
  return connection;
};
