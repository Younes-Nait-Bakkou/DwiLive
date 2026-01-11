import express from "express";
import cors from "cors";

const app = express();
const PORT = 8001;

app.use(
    cors({
        origin: "http://localhost:5173",
    }),
);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
