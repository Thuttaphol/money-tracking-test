import { type TransactionType } from "./transaction";

export type Category = {
  id: number;
  name: string;
  transactionType: TransactionType;
};

export type CategoryInput = {
  name: string;
  transactionType: TransactionType;
};
