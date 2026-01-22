import postman, { type RequestAuthDefinition } from "postman-collection";
import config from "../../config/index.js";

const { RequestAuth } = postman;

const JWT_HEADER_PREFIX = config.jwt.prefix;
export function addJwtAuthToCollection(collection: postman.Collection) {
    const jwtAuthDefinition: RequestAuthDefinition = {
        // @ts-expect-error: 'jwt' is missing from the official type union, but works at runtime
        type: "jwt",
        jwt: [
            {
                key: "isSecretBase64Encoded",
                value: "false",
                type: "boolean",
            },
            { key: "algorithm", value: "HS256", type: "string" },
            { key: "addTokenTo", value: "header", type: "string" },
            { key: "alg", value: "HS256", type: "string" },
            {
                key: "header",
                value: '{\r\n    "typ": "JWT"\r\n}',
                type: "string",
            },
            {
                key: "headerPrefix",
                value: JWT_HEADER_PREFIX,
                type: "string",
            },
            {
                key: "payload",
                value: `{"id":"{{user_id}}", "iat":{{$timestamp}}, "exp":{{jwt_expiry}}}`,
                type: "string",
            },
            { key: "secret", value: "{{jwt_secret}}", type: "string" },
        ],
    };
    collection.auth = new RequestAuth(jwtAuthDefinition);
}
