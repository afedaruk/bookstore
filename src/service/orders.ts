import { eq } from "drizzle-orm";
import { db } from "../db";
import { orders } from "../schema";

export async function createOrder(data: typeof orders.$inferInsert) {
  const [newOrder] = await db.insert(orders).values(data).returning();
  return newOrder;
}

export async function getAllOrders() {
  return await db.select().from(orders);
}

export async function getOrderById(id: number) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id));

  return order;
}

export async function updateOrder(
  id: number,
  data: Partial<typeof orders.$inferInsert>,
) {
  const [updatedOrder] = await db
    .update(orders)
    .set(data)
    .where(eq(orders.id, id))
    .returning();

  return updatedOrder;
}

export async function deleteOrder(id: number) {
  const [deletedOrder] = await db
    .delete(orders)
    .where(eq(orders.id, id))
    .returning();

  return deletedOrder;
}
