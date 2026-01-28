import type { RequestHandler, Request, Response, NextFunction } from "express";

export interface DefaultError {
    message: string;
    code?: string;
    details?: unknown;
}

export type ApiResponse<T, E = DefaultError> = T | E;

export type StandardQuery = Record<string, string | string[] | undefined>;

export type ApiHandler<
    Req = unknown,
    Res = unknown,
    Params = Record<string, never>,
    QueryArgs = StandardQuery,
> = RequestHandler<Params, ApiResponse<Res>, Req, QueryArgs>;

export interface AuthenticatedRequest<
    Params = Record<string, never>,
    ResBody = unknown,
    ReqBody = unknown,
    QueryArgs = StandardQuery,
    Locals extends Record<string, unknown> = Record<string, unknown>,
> extends Request<Params, ResBody, ReqBody, QueryArgs, Locals> {
    user: NonNullable<Request["user"]>;
}

export type AuthHandler<
    Req = unknown,
    Res = unknown,
    Params = Record<string, never>,
    QueryArgs = StandardQuery,
> = (
    req: AuthenticatedRequest<Params, ApiResponse<Res>, Req, QueryArgs>,
    res: Response<ApiResponse<Res>>,
    next: NextFunction,
) => unknown;
