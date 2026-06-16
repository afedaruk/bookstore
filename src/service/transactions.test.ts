import { expect, test, describe, beforeEach } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { books, categories, orderItems, orders, users } from "../schema";
import { createTransaction, getTransactionByOrderId } from "./transactions";

describe("transactions service", () => {
    beforeEach(async () => {
        await db.delete(orderItems);
        await db.delete(orders);
        await db.delete(books);
        await db.delete(users);
        await db.delete(categories);
    });

    test("should create a transaction and remove items from stock", async () => {
        const [user] = await db
            .insert(users)
            .values({ name: "Test", email: "test@test.com" })
            .returning();
        const [book] = await db
            .insert(books)
            .values({ title: "Książka", price: "12.70", stock: 5 })
            .returning();

        const result = await createTransaction({
            userId: user.id,
            items: [{ bookId: book.id, quantity: 2 }],
        });

        expect(result.total).toBe("25.40");
        expect(result.items.length).toBe(1);
        expect(result.items[0].quantity).toBe(2);

        const [updatedBook] = await db
            .select()
            .from(books)
            .where(eq(books.id, book.id));
        expect(updatedBook.stock).toBe(3);
    });

    test("should raise an error when there are not enough items in stock", async () => {
        const [user] = await db
            .insert(users)
            .values({ name: "Test2", email: "test2@test.com" })
            .returning();
        const [book] = await db
            .insert(books)
            .values({ title: "Książka", price: "10.00", stock: 1 })
            .returning();

        expect(
            createTransaction({
                userId: user.id,
                items: [{ bookId: book.id, quantity: 5 }],
            }),
        ).rejects.toThrow(`NOT_ENOUGH_STOCK:${book.title}`);
    });

    test("should take transaction by id", async () => {
        const [user] = await db
            .insert(users)
            .values({ name: "Test3", email: "test3@test.com" })
            .returning();
        const [book] = await db
            .insert(books)
            .values({ title: "Książka", price: "10.00", stock: 5 })
            .returning();

        const tx = await createTransaction({
            userId: user.id,
            items: [{ bookId: book.id, quantity: 1 }],
        });

        const fetchedTx = await getTransactionByOrderId(tx.id);

        expect(fetchedTx).not.toBeNull();
        expect(fetchedTx?.id).toBe(tx.id);
        expect(fetchedTx?.items[0].bookTitle).toBe("Książka");
    });

    test("one should succeed and one should fail in a race condition", async () => {
        const [user1] = await db
            .insert(users)
            .values({ name: "U1", email: "u1@test.com" })
            .returning();
        const [user2] = await db
            .insert(users)
            .values({ name: "U2", email: "u2@test.com" })
            .returning();

        const [book] = await db
            .insert(books)
            .values({ title: "Biały Kruk", price: "100.00", stock: 1 })
            .returning();

        // both at same time
        const results = await Promise.allSettled([
            createTransaction({
                userId: user1.id,
                items: [{ bookId: book.id, quantity: 1 }],
            }),
            createTransaction({
                userId: user2.id,
                items: [{ bookId: book.id, quantity: 1 }],
            }),
        ]);

        const successes = results.filter((r) => r.status === "fulfilled");
        const failures = results.filter((r) => r.status === "rejected");

        expect(successes.length).toBe(1);
        expect(failures.length).toBe(1);

        const [updatedBook] = await db
            .select()
            .from(books)
            .where(eq(books.id, book.id));
        expect(updatedBook.stock).toBe(0);
    });
});
