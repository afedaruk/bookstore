import { Hono } from "hono";

import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  getBookCategoriesList,
  getCategoryRevenue,
  getTopBooksReport,
  getTopUsersReport,
} from "../service/reports";

export const reportsApp = new Hono();

const bookCategoriesResponseSchema = z.array(
  z.object({
    bookTitle: z.string(),
    bookPrice: z.string(),
    stock: z.number(),
    categoryName: z.string().nullable(),
  }),
);

reportsApp.get("/top-books", async (c) => {
  return c.json(await getTopBooksReport());
});

reportsApp.get("/book-categories", async (c) => {
  const list = await getBookCategoriesList();
  return c.json(list, 200);
});

reportsApp.get("/top-users", async (c) => {
  return c.json(await getTopUsersReport());
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
              schema: z.toJSONSchema(bookCategoriesResponseSchema, {
                target: "openapi-3.0",
              }),
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
              schema: z.toJSONSchema(categoryRevenueResponseSchema, {
                target: "openapi-3.0",
              }),
            },
          },
        },
      },
    },
  },
  "/reports/top-books": {
    get: {
      tags: ["Reports"],
      summary: "Get top 10 most bought books",
      responses: {
        200: { description: "Success" },
      },
    },
  },
  "/reports/top-users": {
    get: {
      tags: ["Reports"],
      summary: "Get top 10 users by total spent",
      responses: {
        200: { description: "Success" },
      },
    },
  },
};
