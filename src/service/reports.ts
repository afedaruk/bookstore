import { db } from "../db";
import { bookCategoriesView, categoryRevenueView } from "../schema";
import { desc } from "drizzle-orm";

export async function getBookCategoriesList() {
    return await db.select().from(bookCategoriesView);
}

export async function getCategoryRevenue() {
    return await db
        .select()
        .from(categoryRevenueView)
        .orderBy(desc(categoryRevenueView.totalRevenue))
        .limit(20);
}
