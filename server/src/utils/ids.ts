import { Types, Document } from "mongoose";
import type { IdPrefixType } from "../constants/ids.js";

type MongoReference =
    | string
    | Types.ObjectId
    | Document
    | { _id: Types.ObjectId | string }
    | Buffer
    | null
    | undefined;

export const toPublicId = (
    prefix: IdPrefixType,
    input: MongoReference,
): string => {
    if (!input) {
        throw new Error("Cannot convert null/undefined to public ID");
    }

    let rawId: unknown = input;

    if (typeof input === "object" && "_id" in input && input._id) {
        rawId = input._id;
    }

    if (Buffer.isBuffer(rawId)) {
        return `${prefix}_${rawId.toString("hex")}`;
    }
    if (typeof rawId === "string") {
        return `${prefix}_${rawId}`;
    }

    throw new Error("Invalid input type for toPublicId");
};
