import mongoose, { ObjectId } from "mongoose";

export class User {
    constructor(
      public id: mongoose.Types.ObjectId,
      public username: string,
      public email: string,
      public password: string,
      public refreshToken: string,
      public createdAt: Date,
    ) {}
  }