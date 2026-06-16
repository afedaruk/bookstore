import { eq } from "drizzle-orm";
import { db } from "../db";
import { orderItems } from "../schema";

export async function getAllOrderItems() {
  return await db.select().from(orderItems).orderBy(orderItems.id);
}

export async function getOrderItemById(id: number) {
  const result = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.id, id));

  return result[0] ?? null;
}

export async function createOrderItem(data: typeof orderItems.$inferInsert) {
  const result = await db.insert(orderItems).values(data).returning();

  return result[0];
}

export async function updateOrderItem(
  id: number,
  data: Partial<typeof orderItems.$inferInsert>,
) {
  const result = await db
    .update(orderItems)
    .set(data)
    .where(eq(orderItems.id, id))
    .returning();

  return result[0] ?? null;
}

export async function deleteOrderItem(id: number) {
  const result = await db
    .delete(orderItems)
    .where(eq(orderItems.id, id))
    .returning();

  return result[0] ?? null;
}
