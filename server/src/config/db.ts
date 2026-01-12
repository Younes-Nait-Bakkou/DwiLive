import mongoose, { MongooseError } from "mongoose";

const connectDB = async (mongoUri: string) => {
    try {
        const conn = await mongoose.connect(mongoUri);

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
