import {
    pgTable,
    serial,
    text,
    integer,
    timestamp,
    decimal,
    pgView,
    pgEnum,
} from "drizzle-orm/pg-core";
import { eq, sql } from "drizzle-orm";

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

export const orderStatusEnum = pgEnum("order_status", [
    "pending",
    "paid",
    "shipped",
    "delivered",
    "cancelled",
]);

export const orders = pgTable("orders", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .references(() => users.id)
        .notNull(),
    status: orderStatusEnum("status").default("pending").notNull(),
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

export const bookCategoriesView = pgView("book_categories_view").as((qb) =>
    qb
        .select({
            categoryName: categories.name,
            bookTitle: books.title,
            bookPrice: books.price,
            stock: books.stock,
        })
        .from(categories)
        .rightJoin(books, eq(books.categoryId, categories.id)),
);

export const categoryRevenueView = pgView("category_revenue_view").as((qb) =>
    qb
        .select({
            categoryName: categories.name,
            totalItemsSold:
                sql<number>`COALESCE(sum(${orderItems.quantity}), 0)`
                    .mapWith(Number)
                    .as("totalItemsSold"),
            totalRevenue:
                sql<number>`COALESCE(sum(${orderItems.quantity} * ${orderItems.pricePerItem}), 0)`
                    .mapWith(Number)
                    .as("totalRevenue"),
        })
        .from(categories)
        .leftJoin(books, eq(books.categoryId, categories.id))
        .leftJoin(orderItems, eq(orderItems.bookId, books.id))
        .groupBy(categories.name),
);
