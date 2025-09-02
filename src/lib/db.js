import mongoose from "mongoose";

const connection = {};

export const connectToDb = async () => {
  // If already connected, skip the connection process
  if (connection.isConnected) return;

  try {
    // Connect to MongoDB with proper options for Atlas
    const db = await mongoose.connect(process.env.MONGO_URI, {
      ssl: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 30000, // 30 seconds
      retryWrites: true,
      w: 'majority'
    });
    
    // Set connection status as connected
    connection.isConnected = db.connections[0].readyState;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    
    // Don't throw error in development to avoid crashes
    if (process.env.NODE_ENV === 'development') {
      console.warn("MongoDB connection failed in development mode, continuing without database...");
      return;
    }
    
    throw error;
  }
};
