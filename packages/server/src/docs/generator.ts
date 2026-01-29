import {
    OpenAPIRegistry,
    OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { AuthDomain } from "@dwilive/shared/domains";
import fs from "fs";
import path from "path";
import config from "../config/index.js";

const registry = new OpenAPIRegistry();

// Register the schemas
registry.register("Login", AuthDomain.LoginSchema);
registry.register("Register", AuthDomain.RegisterSchema);

// Register the paths
registry.registerPath({
    method: "post",
    path: "/auth/register",
    summary: "Register a new user",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: AuthDomain.RegisterSchema.shape.body,
                },
            },
        },
    },
    responses: {
        201: {
            description: "User registered successfully",
        },
    },
});

registry.registerPath({
    method: "post",
    path: "/auth/login",
    summary: "Login a user",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: AuthDomain.LoginSchema.shape.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: "User logged in successfully",
        },
    },
});

export function generateOpenApiSpec() {
    const generator = new OpenApiGeneratorV3(registry.definitions);
    const docs = generator.generateDocument({
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "My API",
        },
    });

    const outputPath = path.join(
        config.ROOT_DIR,
        "src",
        "docs",
        "openapi.json",
    );
    fs.writeFileSync(outputPath, JSON.stringify(docs, null, 2));
    console.log(`OpenAPI specification generated at ${outputPath}`);
}

generateOpenApiSpec();
