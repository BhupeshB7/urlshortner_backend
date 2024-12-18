import mongoose from "mongoose";
import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://bhupeshkr2912:jlN1loVL5svE1PbM@blog.vb8d1.mongodb.net/?retryWrites=true&w=majority&appName=blog", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(chalk.italic.magenta(`MongoDB Connected: ${conn.connection.host}`));
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
    process.exit(1);
  }
};

export default connectDB;
