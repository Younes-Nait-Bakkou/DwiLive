import path from "path";
import { fileURLToPath } from "url";

// 1. Create the local variables for this specific file (paths.ts)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.join(__dirname, "../../"); // Go up two levels to reach the project root
global.ROOT_DIR = ROOT_DIR;
