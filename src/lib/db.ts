import mongoose from "mongoose";
const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.Mongo_Url as string);
    console.log(`MongoDB is Connected`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error(`Error: ${String(error)}`);
    }
    process.exit(1);
  }
};
export default connectDB;
