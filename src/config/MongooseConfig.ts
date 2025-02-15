import mongoose from 'mongoose';

class MongoDBConnection {
  private static instance: MongoDBConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }

  public async connect(uri: string) {
    if (!this.isConnected) {
      await mongoose.connect(uri);
      this.isConnected = true;
      console.log('MongoDB connected');
    } else {
      console.log('MongoDB connection already established');
    }
  }
}

export default MongoDBConnection;