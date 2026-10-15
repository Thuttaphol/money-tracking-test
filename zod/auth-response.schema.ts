import * as z from "zod";

// AccessTokenResponse from /openapi/v1.json.
export const AccessTokenResponse = z.object({
  tokenType: z.string().nullable().optional(),
  accessToken: z.string(),
  expiresIn: z.int(),
  refreshToken: z.string(),
});
