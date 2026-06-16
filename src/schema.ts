import {
    pgTable,
    serial,
    text,
    integer,
    timestamp,
    decimal,
    pgView,
} from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";

export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
});

export const books = pgTable("books", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    stock: integer("stock").notNull().default(0),
    categoryId: integer("category_id").references(() => categories.id),
});

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
});

export const carts = pgTable("carts", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .references(() => users.id)
        .unique()
        .notNull(),
});

export const cartItems = pgTable("cart_items", {
    id: serial("id").primaryKey(),
    cartId: integer("cart_id")
        .references(() => carts.id)
        .notNull(),
    bookId: integer("book_id")
        .references(() => books.id)
        .notNull(),
    quantity: integer("quantity").notNull().default(1),
});

export const orders = pgTable("orders", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .references(() => users.id)
        .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

export const orderItems = pgTable("order_items", {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
        .references(() => orders.id)
        .notNull(),
    bookId: integer("book_id")
        .references(() => books.id)
        .notNull(),
    quantity: integer("quantity").notNull(),
    pricePerItem: decimal("price_per_item", {
        precision: 10,
        scale: 2,
    }).notNull(),
});

export const categoryBooksView = pgView("category_books_view").as((qb) =>
    qb
        .select({
            categoryName: categories.name,
            bookTitle: books.title,
            bookPrice: books.price,
            stock: books.stock,
        })
        .from(categories)
        .leftJoin(books, eq(books.categoryId, categories.id)),
);
