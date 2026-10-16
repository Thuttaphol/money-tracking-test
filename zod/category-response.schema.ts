import * as z from "zod";

export const CategoryResponse = z.object({
  id: z.number(),
  name: z.string(),
  transactionType: z.string(),
});

export const GetCategoryResponse = z.array(CategoryResponse);

// CategoryDeleteResponse from /openapi/v1.json.
export const CategoryDeleteResponse = z.object({
  isDeleted: z.boolean(),
});

export const CategoryErrorInvalidTransactionType = z.object({
  title: z.string(),
  status: z.number(),
  detail: z.string(),
  errors: z.object({
    TransactionType: z.array(
      z.literal("The TransactionType field must be Expense or Income."),
    ),
  }),
});

export const CategoryErrorInvalidName = z.object({
  title: z.string(),
  status: z.number(),
  detail: z.string(),
  errors: z.object({
    Name: z.array(z.literal("The field Name must has length from 3 to 50.")),
  }),
});
