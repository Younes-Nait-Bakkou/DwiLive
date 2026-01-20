import type { Document, PopulatedDoc } from "mongoose";

/**
 * Type Guard: Checks if a Mongoose field is fully populated (Document)
 * or just an ID (ObjectId/string).
 */
export const isPopulated = <T extends Document>(
    doc: PopulatedDoc<T> | undefined | null,
): doc is T => {
    return (
        !!doc && // Ensure not null/undefined
        typeof doc === "object" && // Ensure it's an object (Documents are objects)
        "_id" in doc // Ensure it has an '_id' (Ref IDs do not)
    );
};
