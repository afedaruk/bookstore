import { eq } from "drizzle-orm";
import { db } from "../db";
import { orders, orderItems } from "../schema";

export async function getAllOrders() {
  return await db.select().from(orders).orderBy(orders.id);
}

export async function getOrderById(id: number) {
  const result = await db.select().from(orders).where(eq(orders.id, id));
  return result[0] ?? null;
}

export async function createOrder(data: typeof orders.$inferInsert) {
  const result = await db.insert(orders).values(data).returning();
  return result[0];
}

export async function updateOrder(
  id: number,
  data: Partial<typeof orders.$inferInsert>,
) {
  const result = await db
    .update(orders)
    .set(data)
    .where(eq(orders.id, id))
    .returning();

  return result[0] ?? null;
}

export async function deleteOrder(id: number) {
  return await db.transaction(async (tx) => {
    const existingOrder = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, id));

    if (!existingOrder[0]) {
      return null;
    }

    await tx.delete(orderItems).where(eq(orderItems.orderId, id));

    const deletedOrder = await tx
      .delete(orders)
      .where(eq(orders.id, id))
      .returning();

    return deletedOrder[0] ?? null;
  });
}
