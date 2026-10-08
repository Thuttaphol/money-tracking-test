import * as z from "zod";

export const CreateCategoryResponse = z.object({
  id: z.number(),
  name: z.string(),
  transactionType: z.string(),
});

export const CreateCategoryInvalidTransactionType = z.object({
  title: z.string(),
  status: z.number(),
  details: z.string(),
  errors: z.object({
    transactionType: z.array(
      z.literal("The TransactionType field must be Expense or Income."),
    ),
  }),
});

export const CreateCategoryInvalidName = z.object({
  title: z.string(),
  status: z.number(),
  details: z.string(),
  errors: z.object({
    Name: z.array(z.literal("The field Name must has length from 3 to 50.")),
  }),
});
