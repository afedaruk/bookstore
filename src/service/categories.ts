import { db } from "../db";
import { categories } from "../schema";

export async function createCategory(data: typeof categories.$inferInsert) {
    const [newCategory] = await db.insert(categories).values(data).returning();

    return newCategory;
}

export async function getAllCategories() {
    return await db.select().from(categories);
}
