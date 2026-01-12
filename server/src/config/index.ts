import dotenv from "dotenv";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    PORT: z.string().default("3001"),
    MONGODB_URI: z.string(),
    CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

const config = configSchema.parse(process.env);

export default {
    ...config,
    ROOT_DIR: path.join(__dirname, "../.."),
};
