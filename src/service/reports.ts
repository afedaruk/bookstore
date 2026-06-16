import { db } from "../db";
import {
  bookCategoriesView,
  categoryRevenueView,
  topBooksView,
  topUsersView,
} from "../schema";
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

export async function getTopBooksReport() {
  return await db.select().from(topBooksView);
}

export async function getTopUsersReport() {
  return await db.select().from(topUsersView);
}
