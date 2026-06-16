import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  createTransaction,
  getTransactionByOrderId,
} from "../service/transactions";

export const transactionsApp = new Hono();

const createTransactionSchema = z.object({
  userId: z.number().int().positive().max(2147483647),
  items: z
    .array(
      z.object({
        bookId: z.number().int().positive().max(2147483647),
        quantity: z.number().int().positive().max(2147483647),
      }),
    )
    .min(1),
});

const paramSchema = z.object({
  id: z.coerce.number().int().positive(),
});

transactionsApp.post(
  "/",
  zValidator("json", createTransactionSchema),
  async (c) => {
    const body = c.req.valid("json");

    try {
      const transaction = await createTransaction(body);

      return c.json(transaction, 201);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "BOOK_NOT_FOUND") {
          return c.json(
            {
              success: false,
              error: "One or more books were not found",
            },
            404,
          );
        }

        if (error.message.startsWith("NOT_ENOUGH_STOCK:")) {
          const bookTitle = error.message.replace("NOT_ENOUGH_STOCK:", "");

          return c.json(
            {
              success: false,
              error: `Not enough stock for book: ${bookTitle}`,
            },
            400,
          );
        }
      }

      throw error;
    }
  },
);

transactionsApp.get("/:id", zValidator("param", paramSchema), async (c) => {
  const { id } = c.req.valid("param");

  const transaction = await getTransactionByOrderId(id);

  if (!transaction) {
    return c.json(
      {
        success: false,
        error: "Transaction not found",
      },
      404,
    );
  }

  return c.json(transaction, 200);
});

export const transactionsSwaggerPaths = {
  "/transactions": {
    post: {
      tags: ["Transactions"],
      summary: "Create a transaction with order and order items",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: z.toJSONSchema(createTransactionSchema, {
              target: "openapi-3.0",
            }),
          },
        },
      },
      responses: {
        201: {
          description:
            "Transaction created successfully with order and order items",
        },
        400: {
          description: "Invalid input or not enough stock",
        },
        404: {
          description: "Book not found",
        },
      },
    },
  },
  "/transactions/{id}": {
    get: {
      tags: ["Transactions"],
      summary: "Get transaction by order ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "Transaction details",
        },
        404: {
          description: "Transaction not found",
        },
      },
    },
  },
};
