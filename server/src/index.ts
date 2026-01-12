import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

const app = express();
const PORT = process.env.PORT;

app.use(
    cors({
        origin: "http://localhost:5173",
    }),
);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();
