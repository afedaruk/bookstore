import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getAllBooks, createBook, getBookById } from "../service/books";

export const booksApp = new Hono();

const createBookSchema = z.object({
    title: z.string(),
    price: z
        .string()
        .max(11)
        .regex(/^\d{1,8}(\.\d{1,2})?$/)
        .default("9.99"),
    stock: z.number().int().nonnegative().max(2147483647).default(1),
    categoryId: z.number().int().max(2147483647),
});

booksApp.get("/", async (c) => {
    return c.json(await getAllBooks());
});

booksApp.get("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const book = await getBookById(id);
    return book ? c.json(book) : c.text("Not Found", 404);
});

booksApp.post("/", zValidator("json", createBookSchema), async (c) => {
    const body = c.req.valid("json");
    return c.json(await createBook(body), 201);
});

export const booksSwaggerPaths = {
    "/books": {
        get: {
            tags: ["Books"],
            summary: "Get all books",
            responses: {
                200: { description: "Success" },
            },
        },
        post: {
            tags: ["Books"],
            summary: "Create a new book",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: z.toJSONSchema(createBookSchema, {
                            target: "openapi-3.0",
                        }),
                    },
                },
            },
            responses: {
                201: { description: "Book created successfully" },
            },
        },
    },
    "/books/{id}": {
        get: {
            tags: ["Books"],
            summary: "Get a book by ID",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                200: { description: "Book details" },
                404: { description: "Book not found" },
            },
        },
    },
};
