import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../schema";

export async function getAllUsers() {
    return await db.select().from(users);
}

export async function getUserById(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
}

export async function createUser(data: typeof users.$inferInsert) {
    const [newUser] = await db.insert(users).values(data).returning();
    return newUser;
}

export async function updateUser(
    id: number,
    data: Partial<typeof users.$inferInsert>,
) {
    const [updatedUser] = await db
        .update(users)
        .set(data)
        .where(eq(users.id, id))
        .returning();
    return updatedUser;
}

export async function deleteUser(id: number) {
    const [deletedUser] = await db
        .delete(users)
        .where(eq(users.id, id))
        .returning();
    return deletedUser;
}
