const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "Missing MongoDB connection string. Set MONGO_URI in backend/.env"
    );
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    const name = error && error.name ? error.name : "Error";
    console.error(`MongoDB connection failed (${name})`);
    throw new Error("MongoDB connection failed");
  }
}

module.exports = connectDB;
