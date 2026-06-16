import { Hono } from "hono";
import { z } from "zod";
import { getBookCategoriesList, getCategoryRevenue } from "../service/reports";

export const reportsApp = new Hono();

const bookCategoriesResponseSchema = z.array(
    z.object({
        bookTitle: z.string(),
        bookPrice: z.string(),
        stock: z.number(),
        categoryName: z.string().nullable(),
    }),
);

reportsApp.get("/book-categories", async (c) => {
    const list = await getBookCategoriesList();
    return c.json(list, 200);
});

const categoryRevenueResponseSchema = z.array(
    z.object({
        categoryName: z.string(),
        totalItemsSold: z.number(),
        totalRevenue: z.number(),
    }),
);

reportsApp.get("/category-revenue", async (c) => {
    const data = await getCategoryRevenue();
    return c.json(data, 200);
});

export const reportsSwaggerPaths = {
    "/reports/book-categories": {
        get: {
            tags: ["Reports"],
            summary: "Get a list of all books with their categories",
            responses: {
                200: {
                    description: "A flat list of books and their categories",
                    content: {
                        "application/json": {
                            schema: z.toJSONSchema(
                                bookCategoriesResponseSchema,
                                {
                                    target: "openapi-3.0",
                                },
                            ),
                        },
                    },
                },
            },
        },
    },
    "/reports/category-revenue": {
        get: {
            tags: ["Reports"],
            summary: "Get revenue and sales by category",
            responses: {
                200: {
                    description: "Revenue statistics per category",
                    content: {
                        "application/json": {
                            schema: z.toJSONSchema(
                                categoryRevenueResponseSchema,
                                {
                                    target: "openapi-3.0",
                                },
                            ),
                        },
                    },
                },
            },
        },
    },
};
