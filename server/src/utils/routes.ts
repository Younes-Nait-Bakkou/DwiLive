import type { RequestHandler } from "express";
import type { AuthHandler } from "../types/api.js";

// helper to ensure that the handler is a RequestHandler
export const withAuth = <Req, Res, Params, Query>(
    handler: AuthHandler<Req, Res, Params, Query>,
): RequestHandler => {
    return handler as unknown as RequestHandler;
};
