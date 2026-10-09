import * as z from "zod";

export const CategoryResponse = z.object({
  id: z.number(),
  name: z.string(),
  transactionType: z.string(),
});

export const GetCategoryResponse = z.array(CategoryResponse);

export const CategoryErrorInvalidTransactionType = z.object({
  title: z.string(),
  status: z.number(),
  details: z.string(),
  errors: z.object({
    transactionType: z.array(
      z.literal("The TransactionType field must be Expense or Income."),
    ),
  }),
});

export const CategoryErrorInvalidName = z.object({
  title: z.string(),
  status: z.number(),
  details: z.string(),
  errors: z.object({
    Name: z.array(z.literal("The field Name must has length from 3 to 50.")),
  }),
});
