import * as z from "zod";

// ApiErrorResponse and ApiValidationErrorResponse from /openapi/v1.json.
const errorFields = {
  title: z.string(),
  status: z.int32(),
  detail: z.string(),
};

export const ApiErrorResponse = z.object({
  ...errorFields,
  traceId: z.string().nullable().optional(),
});

export const ApiValidationErrorResponse = z.object({
  ...errorFields,
  errors: z.record(z.string(), z.array(z.string())),
});
