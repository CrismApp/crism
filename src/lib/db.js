import mongoose from "mongoose";

const connection = {};

export const connectToDb = async () => {
  // If already connected, skip the connection process
  if (connection.isConnected) return;

  try {
    // Connect to MongoDB without deprecated options
    const db = await mongoose.connect(process.env.MONGO_URI);
    
    // Set connection status as connected
    connection.isConnected = db.connections[0].readyState;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw new Error(error);
  }
};
