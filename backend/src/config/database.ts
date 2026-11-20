import mongoose from "mongoose";

class Database {
  private static instance: Database;
  private connected: boolean = false;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(uri: string): Promise<void> {
    if (this.connected) return;
    await mongoose.connect(uri);
    this.connected = true;
    console.log("Connected to MongoDB")
  }
}

export const db = Database.getInstance();
