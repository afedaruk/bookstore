import { eq } from "drizzle-orm";
import { db } from "../db";
import { books } from "../schema";

export async function createBook(data: typeof books.$inferInsert) {
    const [newBook] = await db.insert(books).values(data).returning();
    return newBook;
}

export async function getAllBooks() {
    return await db.select().from(books);
}

export async function getBookById(id: number) {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
}

export async function updateBook(
    id: number,
    data: Partial<typeof books.$inferInsert>,
) {
    const [updatedBook] = await db
        .update(books)
        .set(data)
        .where(eq(books.id, id))
        .returning();
    return updatedBook;
}

export async function deleteBook(id: number) {
    const [deletedBook] = await db
        .delete(books)
        .where(eq(books.id, id))
        .returning();
    return deletedBook;
}
