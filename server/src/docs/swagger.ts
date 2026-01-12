import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import type { Express } from "express";

const openapiSpec = YAML.load(
    path.join(global.ROOT_DIR, "./src/docs/openapi.yaml"),
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
        res.sendFile(path.join(__dirname, "./openapi.yaml"));
    });

    app.get("/openapi.json", (_req, res) => {
        res.json(openapiSpec);
    });
}
