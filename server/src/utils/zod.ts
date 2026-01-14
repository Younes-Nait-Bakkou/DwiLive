import { z } from "zod";
import { isValidObjectId } from "mongoose";

export const objectId = z.string().refine((val) => isValidObjectId(val), {
    message: "Invalid MongoDB ObjectId",
});
