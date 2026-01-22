import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import Converter from "openapi-to-postmanv2";
import postman from "postman-collection";

import { extractUsersFromSeed } from "./utils/file-utils.js";
import {
    createGlobalEnvironment,
    createUserEnvironment,
} from "./builders/environments.js";
import { addJwtAuthToCollection } from "./modifiers/add-jwt-auth.js";
import { patchLoginRequest } from "./modifiers/patch-login.js";

const { Collection, Variable, Event, Script } = postman;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../..");
const OUTPUT_DIR = path.resolve(ROOT_DIR, "dist/postman");

const OPENAPI_SPEC_PATH = path.resolve(ROOT_DIR, "src/docs/openapi.yaml");

async function generate() {
    console.log("🚀 Starting Postman collection generation...");

    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // --- Generate Environments ---
    const globalEnv = createGlobalEnvironment();
    fs.writeFileSync(
        path.join(OUTPUT_DIR, "dwilive.postman_globals.json"),
        JSON.stringify(globalEnv, null, 2),
    );
    console.log("✅ Generated: DwiLive Global Environment");

    const usernames = extractUsersFromSeed();
    if (usernames.length === 0) {
        console.warn("⚠️ No users found in seed file.");
    } else {
        usernames.forEach((username) => {
            const userEnv = createUserEnvironment(username);
            fs.writeFileSync(
                path.join(OUTPUT_DIR, `${username}.postman_environment.json`),
                JSON.stringify(userEnv, null, 2),
            );
            console.log(`✅ Generated: Environment for ${username}`);
        });
    }

    // --- Generate REST Collection ---
    const openapiData = fs.readFileSync(OPENAPI_SPEC_PATH, {
        encoding: "utf8",
    });

    Converter.convert(
        { type: "string", data: openapiData },
        {},
        (_err, conversionResult) => {
            if (!conversionResult.result) {
                console.error(
                    "❌ Could not convert OpenAPI:",
                    conversionResult.reason,
                );
                process.exit(1);
            }

            const collection = new Collection(
                conversionResult.output[0]!.data!,
            );
            collection.name = "DwiLive REST API";

            // Add pre-request script to the collection
            collection.events.add(
                new Event({
                    listen: "prerequest",
                    script: new Script({
                        exec: [
                            "function parseDurationToMilliseconds(duration) {",
                            "    // Base case: if it's already a number, assume it is milliseconds",
                            "    if (typeof duration === 'number') return duration;",
                            "    ",
                            "    var unit = duration.slice(-1);",
                            "    var value = parseFloat(duration.slice(0, -1));",
                            "",
                            "    switch (unit) {",
                            "        case 'd': // Days -> convert to Hours",
                            "            return parseDurationToMilliseconds((value * 24) + 'h');",
                            "        case 'h': // Hours -> convert to Minutes",
                            "            return parseDurationToMilliseconds((value * 60) + 'm');",
                            "        case 'm': // Minutes -> convert to Seconds",
                            "            return parseDurationToMilliseconds((value * 60) + 's');",
                            "        case 's': // Seconds -> convert to Milliseconds (Your Request)",
                            "            return value * 1000; ",
                            "        default: ",
                            "            // Fallback for plain strings (e.g. \"500\") -> assume ms",
                            "            return parseFloat(duration) || 0;",
                            "    }",
                            "}",
                            "var expiresIn = pm.globals.get(\"jwt_expires_in\")",
                            "var durationMs = parseDurationToMilliseconds(expiresIn);",
                            "var expTimeSeconds = Math.floor((Date.now() + durationMs)/1000);",
                            "console.log(expTimeSeconds)",
                            "pm.variables.set('jwt_expiry', expTimeSeconds);",
                        ],
                        type: "text/javascript",
                    }),
                }),
            );

            // Apply modifiers
            addJwtAuthToCollection(collection);
            patchLoginRequest(collection);

            // Set base URL as a collection variable
            collection.variables.add(
                new Variable({
                    key: "baseUrl",
                    value: "http://localhost:3001/api/v1",
                    type: "string",
                }),
            );

            fs.writeFileSync(
                path.join(OUTPUT_DIR, "dwilive.postman_collection.json"),
                JSON.stringify(collection.toJSON(), null, 2),
            );
            console.log("✅ Generated: DwiLive REST API Collection");
            console.log(
                "\n🎉 Generation complete! Files are in `dist/postman`",
            );
        },
    );
}

generate().catch((err) => {
    console.error("❌ An error occurred during generation:", err);
    process.exit(1);
});
