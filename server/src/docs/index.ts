import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import type { Express } from "express";
import config from "../config/index.js";
import path from "path";
import Generator from "@asyncapi/generator";
import express from "express";

const openapiSpec = YAML.load(
    path.join(config.ROOT_DIR, "./src/docs/openapi.yaml"),
);

export async function setupDocs(app: Express) {
    // --- OpenAPI (Swagger) Docs ---
    app.use(
        "/docs",
        swaggerUi.serve,
        swaggerUi.setup(openapiSpec, {
            explorer: true,
            customSiteTitle: "My API Docs",
        }),
    );

    app.get("/openapi.yaml", (_req, res) => {
        const yamlpath = path.join(config.ROOT_DIR, "./src/docs/openapi.yaml");

        res.sendFile(yamlpath);
    });

    app.get("/openapi.json", (_req, res) => {
        res.json(openapiSpec);
    });

    // --- AsyncAPI Docs ---
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
        console.log("Attempting to generate AsyncAPI documentation...");
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

        app.use("/asyncapi", express.static(asyncapiHtmlOutputPath));

        app.get("/asyncapi.yaml", (_req, res) => {
            res.sendFile(asyncapiSpecPath);
        });
    } catch (error) {
        console.error(
            "Error generating or serving AsyncAPI documentation:",
            error,
        );
        app.get("/asyncapi", (_req, res) => {
            res.status(500).send("Error generating AsyncAPI documentation.");
        });
        app.get("/asyncapi.yaml", (_req, res) => {
            res.status(500).send("Error retrieving AsyncAPI specification.");
        });
    }
}
