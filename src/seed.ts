import * as fs from "fs";
import * as path from "path";
import { db } from "./db";
import { categories, users, books } from "./schema";

function readCsv(filename: string) {
    const filePath = path.join(__dirname, filename);
    const rows = fs.readFileSync(filePath, "utf-8").trim().split("\n");
    const headers = rows.shift()?.split(",") || [];

    return rows.map((row) => {
        const values = row.split(",");
        return headers.reduce(
            (obj, header, i) => {
                obj[header.trim()] = values[i]?.trim();
                return obj;
            },
            {} as Record<string, any>,
        );
    });
}

async function seed() {
    console.log("start seed");

    try {
        console.log("delete data");
        await db.delete(books);
        await db.delete(categories);
        await db.delete(users);

        const categoriesData = readCsv(
            "../data/categories.csv",
        ) as (typeof categories.$inferInsert)[];
        const usersData = readCsv(
            "../data/users.csv",
        ) as (typeof users.$inferInsert)[];
        const booksData = readCsv("../data/books.csv").map((b) => ({
            ...b,
            stock: Number(b.stock),
            categoryId: Number(b.categoryId),
        })) as (typeof books.$inferInsert)[];

        console.log("insert categories");
        await db.insert(categories).values(categoriesData);

        console.log("insert users");
        await db.insert(users).values(usersData);

        console.log("insert books");
        await db.insert(books).values(booksData);

        console.log("end seed");
    } catch (error) {
        console.error("seed error", error);
    } finally {
        process.exit(0);
    }
}

seed();
