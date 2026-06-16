import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createCategory, getAllCategories } from "../service/categories";

export const categoriesApp = new Hono();

const createCategorySchema = z.object({
    name: z.string().min(1).max(255),
});

categoriesApp.get("/", async (c) => {
    return c.json(await getAllCategories(), 200);
});

categoriesApp.post("/", zValidator("json", createCategorySchema), async (c) => {
    const body = c.req.valid("json");
    return c.json(await createCategory(body), 201);
});

export const categoriesSwaggerPaths = {
    "/categories": {
        get: {
            tags: ["Categories"],
            summary: "Get all categories",
            responses: { 200: { description: "Success" } },
        },
        post: {
            tags: ["Categories"],
            summary: "Create a new category",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: z.toJSONSchema(createCategorySchema, {
                            target: "openapi-3.0",
                        }),
                    },
                },
            },
            responses: {
                201: { description: "Category created successfully" },
            },
        },
    },
};
