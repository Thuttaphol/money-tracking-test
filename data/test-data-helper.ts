import { db } from "../database/db";
import { environment } from "../config/environment";

type CreateCategoryData = {
  id: number;
  name: string;
  transactionType: string;
};

export async function createCategories(categories: CreateCategoryData[]) {
  const values = categories.flatMap((c) => [
    c.id,
    c.name,
    c.transactionType,
    environment.testUser.id,
  ]);

  const placeholder = categories
    .map((_, index) => {
      const offset = index * 4;
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
    })
    .join(", ");

  const query = `
  INSERT INTO money.category (id, name, transaction_type, app_user_id)
  VALUES ${placeholder}
  RETURNING *;
  `;

  const result = await db.query(query, values);

  return result.rows;
}

export async function deleteCategories(categories: CreateCategoryData[]) {
  const values = categories.map((c) => c.id);

  const placeholder = categories
    .map((_, index) => {
      return `$${index + 1}`;
    })
    .join(", ");

  const query = `
  DELETE FROM money.category
  WHERE id IN (${placeholder})
  AND app_user_id = '${environment.testUser.id}'
  `;

  const result = await db.query(query, values);

  return result.rows;
}

export async function deleteCategory(id: number, userId: string) {
  const query = `
  DELETE FROM money.category
  WHERE id = '${id}'
  AND app_user_id = '${userId}'
  `;

  const result = await db.query(query);

  return result.rows;
}
