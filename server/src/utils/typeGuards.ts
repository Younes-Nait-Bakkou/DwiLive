import { Document, Types, type PopulatedDoc } from "mongoose";

/**
 * Type Guard: Checks if a Mongoose field is a fully populated Document.
 * Returns true if it is a Document, false if it is an ID (String/ObjectId).
 */
export const isPopulated = <T extends Document>(
    doc: PopulatedDoc<T> | undefined | null,
): doc is T => {
    if (!doc) return false;

    if (doc instanceof Types.ObjectId) return false;

    if (typeof doc === "string") return false;

    return typeof (doc as T).populated === "function";
};
