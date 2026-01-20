import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";
import ms, { type StringValue } from "ms";
import { configDotenv } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    PORT: z.string().default("3001"),
    MONGODB_URI: z.string(),
    CORS_ORIGIN: z.string().default("http://localhost:5173"),
    JWT_SECRET: z.string().default("secret"),
    JWT_EXPIRES_IN: z
        .string()
        .default("30d")
        .refine((value) => {
            return typeof ms(value as StringValue) === "number";
        }, "Invalid duration format (e.g., '1h', '2d')")
        .transform((value) => value as StringValue),
    JWT_HEADER_PREFIX: z.string().default("Bearer"),
});

configDotenv();

const config = configSchema.parse(process.env);

export default {
    NODE_ENV: config.NODE_ENV,
    PORT: config.PORT,
    MONGODB_URI: config.MONGODB_URI,
    CORS_ORIGIN: config.CORS_ORIGIN,
    ROOT_DIR: path.join(__dirname, "../.."),
    jwt: {
        secret: config.JWT_SECRET,
        expiresIn: config.JWT_EXPIRES_IN,
        prefix: config.JWT_HEADER_PREFIX,
    },
};
