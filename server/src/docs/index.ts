import swaggerUi from "swagger-ui-express";
import fs from "fs";
import type { Express } from "express";
import config from "../config/index.js";
import path from "path";
import Generator from "@asyncapi/generator";
import express, { Router } from "express";
import YAML from "yamljs";

const liveOpenApiSpec = JSON.parse(
    fs.readFileSync(
        path.join(config.ROOT_DIR, "./src/docs/openapi.json"),
        "utf-8",
    ),
);

const staticOpenApiSpec = YAML.load(
    path.join(config.ROOT_DIR, "./src/docs/openapi.yaml"),
);

export async function setupDocs(app: Express) {
    const docsRouter = Router();

    // --- Options Configuration ---
    // It's best to define options outside to pass them to BOTH serveFiles and setup
    const liveOptions = {
        explorer: true,
        customSiteTitle: "Live API Docs",
    };

    const staticOptions = {
        explorer: true,
        customSiteTitle: "Static API Docs",
    };

    // --- Live OpenAPI (Swagger) Docs ---
    docsRouter.use(
        "/live/openapi",
        // FIX: Use serveFiles and pass the spec/options here too
        swaggerUi.serveFiles(liveOpenApiSpec, liveOptions),
        swaggerUi.setup(liveOpenApiSpec, liveOptions),
    );

    docsRouter.get("/live/openapi.json", (_req, res) => {
        res.json(liveOpenApiSpec);
    });

    // --- Static OpenAPI (Swagger) Docs ---
    docsRouter.use(
        "/static/openapi",
        // FIX: Use serveFiles here as well
        swaggerUi.serveFiles(staticOpenApiSpec, staticOptions),
        swaggerUi.setup(staticOpenApiSpec, staticOptions),
    );

    docsRouter.get("/static/openapi.yaml", (_req, res) => {
        const yamlpath = path.join(config.ROOT_DIR, "./src/docs/openapi.yaml");
        res.sendFile(yamlpath);
    });

    // --- AsyncAPI Docs ---
    // (Your existing AsyncAPI code remains unchanged)
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
            { forceWrite: true, install: true },
        );
        await generator.generateFromFile(asyncapiSpecPath);
        docsRouter.use("/asyncapi", express.static(asyncapiHtmlOutputPath));
    } catch (error) {
        console.error("Error generating AsyncAPI docs:", error);
    }

    app.use("/docs", docsRouter);
}
