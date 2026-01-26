import type { RequestHandler, Request } from "express";
import { z, ZodError } from "zod";

type AnyRequestSchema = z.ZodType<{
    body?: unknown;
    query?: unknown;
    params?: unknown;
}>;

export const validate =
    (schema: AnyRequestSchema): RequestHandler =>
    async (req, res, next) => {
        try {
            const parsedData = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            if (parsedData.body) {
                req.body = parsedData.body;
            }

            if (parsedData.query) {
                Object.defineProperty(req, "query", {
                    value: parsedData.query,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                });
            }

            if (parsedData.params) {
                Object.defineProperty(req, "params", {
                    value: parsedData.params,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                });
            }
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    status: "fail",
                    errors: error.issues,
                });
                return;
            }
            return next(error);
        }
    };
