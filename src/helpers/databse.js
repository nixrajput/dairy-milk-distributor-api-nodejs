import mongoose from "mongoose";

const db = {
  connect: async () => {
    try {
      mongoose.connect(process.env.MONGO_URI, {
        dbName: process.env.DB_NAME,
        autoIndex: true,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 60000,
      });
      console.log(`[database]: connected successfully to MongoDB`);
    } catch (err) {
      console.log(`[database]: could not connect due to [${err.message}]`);
      throw err;
    }
  },
};

export { db };
