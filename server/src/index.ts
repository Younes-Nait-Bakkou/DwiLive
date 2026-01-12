import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { setupDocs } from "./docs/index.js";
import config from "./config/index.js";

const app = express();

app.use(
    cors({
        origin: config.CORS_ORIGIN,
    }),
);

await setupDocs(app);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

const startServer = async () => {
    try {
        await connectDB(config.MONGODB_URI);
        app.listen(config.PORT, () => {
            console.log(`Server is running on port ${config.PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
};

startServer();
