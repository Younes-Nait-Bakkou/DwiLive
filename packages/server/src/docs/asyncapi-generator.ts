import Generator from "@asyncapi/generator";
import path from "path";
import config from "../config/index.js";

async function generateAsyncApiSpec() {
    console.log("Attempting to generate AsyncAPI documentation...");
    const asyncapiHtmlOutputPath = path.join(
        config.ROOT_DIR,
        "tmp",
        "asyncapi-html",
    );

    const asyncapiSpecPath = path.join(
        config.ROOT_DIR,
        "./src/docs/asyncapi.yaml",
    );
    try {
        const generator = new Generator(
            "@asyncapi/html-template",
            asyncapiHtmlOutputPath,
            {
                forceWrite: true,
                install: true,
            },
        );

        await generator.generateFromFile(asyncapiSpecPath);
        console.log(
            `AsyncAPI HTML documentation generated to: ${asyncapiHtmlOutputPath}`,
        );
    } catch (error) {
        console.error("Error generating AsyncAPI documentation:", error);
        process.exit(1);
    }
}

generateAsyncApiSpec();
