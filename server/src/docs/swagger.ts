import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import type { Express } from "express";
import config from "../config/index.js";
import path from "path";

const openapiSpec = YAML.load(
    path.join(config.ROOT_DIR, "./src/docs/openapi.yaml"),
);

export function setupSwagger(app: Express) {
    // Interactive docs
    app.use(
        "/docs",
        swaggerUi.serve,
        swaggerUi.setup(openapiSpec, {
            explorer: true,
            customSiteTitle: "My API Docs",
        }),
    );

    // Raw specs
    app.get("/openapi.yaml", (_req, res) => {
        res.sendFile(path.join(config.ROOT_DIR, "./src/docs/openapi.yaml"));
    });

    app.get("/openapi.json", (_req, res) => {
        res.json(openapiSpec);
    });
}
