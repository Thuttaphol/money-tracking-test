import type { Category, CategoryInput } from "./category";
import type { TransactionType } from "./transaction";

type LoginResponseType = {
  tokenType: string;
  accessToken: "string";
  expiresIn: number;
  refreshToken: "string";
};

type DeleteResultType = {
  isDeleted: boolean;
};

export {
  Category,
  CategoryInput,
  TransactionType,
  LoginResponseType,
  DeleteResultType,
};
