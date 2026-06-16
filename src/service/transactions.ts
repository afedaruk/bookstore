import { eq, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import { books, orders, orderItems } from "../schema";

type TransactionItemInput = {
  bookId: number;
  quantity: number;
};

type CreateTransactionInput = {
  userId: number;
  items: TransactionItemInput[];
};

export async function createTransaction(data: CreateTransactionInput) {
  return await db.transaction(async (tx) => {
    const mergedItemsMap = new Map<number, number>();

    for (const item of data.items) {
      const currentQuantity = mergedItemsMap.get(item.bookId) ?? 0;
      mergedItemsMap.set(item.bookId, currentQuantity + item.quantity);
    }

    const mergedItems = Array.from(mergedItemsMap.entries()).map(
      ([bookId, quantity]) => ({
        bookId,
        quantity,
      }),
    );

    const bookIds = mergedItems.map((item) => item.bookId);

    const foundBooks = await tx
      .select()
      .from(books)
      .where(inArray(books.id, bookIds));

    if (foundBooks.length !== bookIds.length) {
      throw new Error("BOOK_NOT_FOUND");
    }

    const booksMap = new Map(foundBooks.map((book) => [book.id, book]));

    let total = 0;

    for (const item of mergedItems) {
      const book = booksMap.get(item.bookId);

      if (!book) {
        throw new Error("BOOK_NOT_FOUND");
      }

      if (book.stock < item.quantity) {
        throw new Error(`NOT_ENOUGH_STOCK:${book.title}`);
      }

      total += Number(book.price) * item.quantity;
    }

    const insertedOrders = await tx
      .insert(orders)
      .values({
        userId: data.userId,
        status: "pending",
        total: total.toFixed(2),
      })
      .returning();

    const order = insertedOrders[0];

    const itemsToInsert = mergedItems.map((item) => {
      const book = booksMap.get(item.bookId);

      if (!book) {
        throw new Error("BOOK_NOT_FOUND");
      }

      return {
        orderId: order.id,
        bookId: item.bookId,
        quantity: item.quantity,
        pricePerItem: book.price,
      };
    });

    const insertedOrderItems = await tx
      .insert(orderItems)
      .values(itemsToInsert)
      .returning();

    for (const item of mergedItems) {
      await tx
        .update(books)
        .set({
          stock: sql`${books.stock} - ${item.quantity}`,
        })
        .where(eq(books.id, item.bookId));
    }

    return {
      ...order,
      items: insertedOrderItems,
    };
  });
}

export async function getTransactionByOrderId(orderId: number) {
  const orderResult = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId));

  const order = orderResult[0];

  if (!order) {
    return null;
  }

  const items = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      bookId: orderItems.bookId,
      bookTitle: books.title,
      quantity: orderItems.quantity,
      pricePerItem: orderItems.pricePerItem,
    })
    .from(orderItems)
    .leftJoin(books, eq(orderItems.bookId, books.id))
    .where(eq(orderItems.orderId, orderId));

  return {
    ...order,
    items,
  };
}
