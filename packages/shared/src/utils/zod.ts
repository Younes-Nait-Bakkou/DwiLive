import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// 1. Drop the mongoose import
// import { isValidObjectId } from "mongoose";

extendZodWithOpenApi(z);

export { z };

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createPrefixedIdSchema = (
  prefix: string,
  options?: {
    invalidError?: string;
    requiredError?: string;
  },
) => {
  const fullPrefix = prefix + "_"; // Store slightly cleaner variable name

  const stripPrefix = (val: unknown) => {
    if (typeof val === "string" && val.startsWith(fullPrefix)) {
      return val.replace(fullPrefix, "");
    }
    return val;
  };

  return z.preprocess(
    stripPrefix,
    z
      .string({
        error: options?.requiredError,
      })
      // 2. Use Regex instead of isValidObjectId
      .regex(objectIdRegex, {
        message: options?.invalidError || `Invalid ${prefix}ID format`,
      }),
  );
};
