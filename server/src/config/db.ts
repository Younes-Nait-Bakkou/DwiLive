import mongoose, { MongooseError } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: unknown) {
        let errorObj: { type: string; message: string } = {
            type: "Error",
            message: "An unknown error occurred",
        };

        if (error instanceof MongooseError) {
            errorObj.type = "MongooseError";
            errorObj.message = error.message;
        } else if (error instanceof Error) {
            errorObj.type = "Error";
            errorObj.message = error.message;
        }
        console.error(
            `MongoDB Connection Error: ${errorObj.type} - ${errorObj.message}`,
        );
        process.exit(1);
    }
};

export default connectDB;
