import mongoose from "mongoose";
import { atlasUrl, dbName } from "../constants/envConstants.js";
const connectDb = async () => {
  try {
    const conn = await mongoose.connect(atlasUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: dbName,
    });
    console.log(`MongoDb Connected ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.log(`Error ${error.message}`.red.bold);
    process.exit(1);
  }
};

export default connectDb;
