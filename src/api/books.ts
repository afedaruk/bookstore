import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
    getAllBooks,
    createBook,
    getBookById,
    updateBook,
    deleteBook,
} from "../service/books";

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

const updateBookSchema = createBookSchema.partial();

const paramSchema = z.object({
    id: z.coerce.number().int().positive(),
});

booksApp.get("/", async (c) => {
    return c.json(await getAllBooks());
});

booksApp.get("/:id", zValidator("param", paramSchema), async (c) => {
    const { id } = c.req.valid("param");
    const book = await getBookById(id);
    return book ? c.json(book) : c.text("Not Found", 404);
});

booksApp.post("/", zValidator("json", createBookSchema), async (c) => {
    const body = c.req.valid("json");
    return c.json(await createBook(body), 201);
});

booksApp.patch(
    "/:id",
    zValidator("param", paramSchema),
    zValidator("json", updateBookSchema),
    async (c) => {
        const { id } = c.req.valid("param");
        const body = c.req.valid("json");

        if (Object.keys(body).length === 0) {
            return c.json(
                { success: false, error: "No data provided for update" },
                400,
            );
        }

        const updatedBook = await updateBook(id, body);

        if (!updatedBook) {
            return c.json({ success: false, error: "Book not found" }, 404);
        }

        return c.json(updatedBook, 200);
    },
);

booksApp.delete("/:id", zValidator("param", paramSchema), async (c) => {
    const { id } = c.req.valid("param");

    const deletedBook = await deleteBook(id);

    if (!deletedBook) {
        return c.json({ success: false, error: "Book not found" }, 404);
    }

    return c.json(
        {
            success: true,
            message: `Book with ID ${id} deleted successfully`,
        },
        200,
    );
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
        patch: {
            tags: ["Books"],
            summary: "Update a book by ID",
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
                        schema: z.toJSONSchema(updateBookSchema, {
                            target: "openapi-3.0",
                        }),
                    },
                },
            },
            responses: {
                200: { description: "Book updated successfully" },
                400: { description: "Invalid input or empty body" },
                404: { description: "Book not found" },
            },
        },
        delete: {
            tags: ["Books"],
            summary: "Delete a book by ID",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                200: { description: "Book deleted successfully" },
                404: { description: "Book not found" },
            },
        },
    },
};
