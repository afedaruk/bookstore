import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} from "../service/users";

export const usersApp = new Hono();

const createUserSchema = z.object({
    name: z.string().min(1).max(255),
    email: z.email().max(255),
});

const updateUserSchema = createUserSchema.partial();

const paramSchema = z.object({
    id: z.coerce.number().int().positive(),
});

usersApp.get("/", async (c) => c.json(await getAllUsers(), 200));

usersApp.get("/:id", zValidator("param", paramSchema), async (c) => {
    const { id } = c.req.valid("param");
    const user = await getUserById(id);
    return user
        ? c.json(user, 200)
        : c.json({ success: false, error: "User not found" }, 404);
});

usersApp.post("/", zValidator("json", createUserSchema), async (c) => {
    const body = c.req.valid("json");
    return c.json(await createUser(body), 201);
});

usersApp.patch(
    "/:id",
    zValidator("param", paramSchema),
    zValidator("json", updateUserSchema),
    async (c) => {
        const { id } = c.req.valid("param");
        const body = c.req.valid("json");

        if (Object.keys(body).length === 0)
            return c.json({ success: false, error: "No data provided" }, 400);

        const updatedUser = await updateUser(id, body);
        return updatedUser
            ? c.json(updatedUser, 200)
            : c.json({ success: false, error: "User not found" }, 404);
    },
);

usersApp.delete("/:id", zValidator("param", paramSchema), async (c) => {
    const { id } = c.req.valid("param");
    const deletedUser = await deleteUser(id);
    return deletedUser
        ? c.json({ success: true, message: `User ${id} deleted` }, 200)
        : c.json({ success: false, error: "User not found" }, 404);
});

export const usersSwaggerPaths = {
    "/users": {
        get: {
            tags: ["Users"],
            summary: "Get all users",
            responses: { 200: { description: "Success" } },
        },
        post: {
            tags: ["Users"],
            summary: "Create a user",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: z.toJSONSchema(createUserSchema, {
                            target: "openapi-3.0",
                        }),
                    },
                },
            },
            responses: {
                201: { description: "Created" },
                400: { description: "Email taken / Invalid input" },
            },
        },
    },
    "/users/{id}": {
        get: {
            tags: ["Users"],
            summary: "Get a user",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                200: { description: "Success" },
                404: { description: "Not found" },
            },
        },
        patch: {
            tags: ["Users"],
            summary: "Update a user",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: z.toJSONSchema(updateUserSchema, {
                            target: "openapi-3.0",
                        }),
                    },
                },
            },
            responses: {
                200: { description: "Updated" },
                400: { description: "Email taken" },
                404: { description: "Not found" },
            },
        },
        delete: {
            tags: ["Users"],
            summary: "Delete a user",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                200: { description: "Deleted" },
                404: { description: "Not found" },
            },
        },
    },
};
