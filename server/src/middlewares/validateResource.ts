import type { RequestHandler } from "express";
import z, { ZodError } from "zod";

export const validate =
    (schema: z.ZodType): RequestHandler =>
    async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });

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
