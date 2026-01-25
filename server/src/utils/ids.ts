import { Types } from "mongoose";
import type { IdPrefixType } from "../constants/ids.js";

type MongoId = string | Types.ObjectId | { toString: () => string };

export const toPublicId = (prefix: IdPrefixType, id: MongoId): string => {
    return `${prefix}_${id.toString()}`;
};
