import express from "express";
import cors from "cors";
import { createServer } from "http";
import connectDB from "./config/db.js";
import config from "./config/index.js";
import globalRouter from "./routes/index.js";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(
    cors({
        origin: config.CORS_ORIGIN,
    }),
);

app.use("/api", globalRouter);

const startServer = async () => {
    try {
        await connectDB(config.MONGODB_URI);
        httpServer.listen(config.PORT, () => {
            console.log(`Server is running on port ${config.PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
};

startServer();
