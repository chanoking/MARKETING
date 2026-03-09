import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const URI = process.env.URI;
const client = new MongoClient(URI);

let db;

export const connectDB = async () => {
  try {
    await client.connect();
    db = client.db("LifeNBio");
    
    console.log("MongoDB connected");
    
    return db

  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

