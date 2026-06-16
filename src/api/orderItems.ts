import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  getAllOrderItems,
  createOrderItem,
  getOrderItemById,
  updateOrderItem,
  deleteOrderItem,
} from "../service/orderItems";

export const orderItemsApp = new Hono();

const createOrderItemSchema = z.object({
  orderId: z.number().int().positive().max(2147483647),
  bookId: z.number().int().positive().max(2147483647),
  quantity: z.number().int().positive().max(2147483647),
  pricePerItem: z
    .string()
    .max(11)
    .regex(/^\d{1,8}(\.\d{1,2})?$/),
});

const updateOrderItemSchema = createOrderItemSchema.partial();

const paramSchema = z.object({
  id: z.coerce.number().int().positive(),
});

orderItemsApp.get("/", async (c) => {
  return c.json(await getAllOrderItems());
});

orderItemsApp.get("/:id", zValidator("param", paramSchema), async (c) => {
  const { id } = c.req.valid("param");

  const orderItem = await getOrderItemById(id);

  return orderItem ? c.json(orderItem) : c.text("Not Found", 404);
});

orderItemsApp.post(
  "/",
  zValidator("json", createOrderItemSchema),
  async (c) => {
    const body = c.req.valid("json");

    return c.json(await createOrderItem(body), 201);
  },
);

orderItemsApp.patch(
  "/:id",
  zValidator("param", paramSchema),
  zValidator("json", updateOrderItemSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    if (Object.keys(body).length === 0) {
      return c.json(
        { success: false, error: "No data provided for update" },
        400,
      );
    }

    const updatedOrderItem = await updateOrderItem(id, body);

    if (!updatedOrderItem) {
      return c.json({ success: false, error: "Order item not found" }, 404);
    }

    return c.json(updatedOrderItem, 200);
  },
);

orderItemsApp.delete("/:id", zValidator("param", paramSchema), async (c) => {
  const { id } = c.req.valid("param");

  const deletedOrderItem = await deleteOrderItem(id);

  if (!deletedOrderItem) {
    return c.json({ success: false, error: "Order item not found" }, 404);
  }

  return c.json(
    {
      success: true,
      message: `Order item with ID ${id} deleted successfully`,
    },
    200,
  );
});

export const orderItemsSwaggerPaths = {
  "/order-items": {
    get: {
      tags: ["Order Items"],
      summary: "Get all order items",
      responses: {
        200: { description: "Success" },
      },
    },
    post: {
      tags: ["Order Items"],
      summary: "Create a new order item",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: z.toJSONSchema(createOrderItemSchema, {
              target: "openapi-3.0",
            }),
          },
        },
      },
      responses: {
        201: { description: "Order item created successfully" },
      },
    },
  },
  "/order-items/{id}": {
    get: {
      tags: ["Order Items"],
      summary: "Get an order item by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: { description: "Order item details" },
        404: { description: "Order item not found" },
      },
    },
    patch: {
      tags: ["Order Items"],
      summary: "Update an order item by ID",
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
            schema: z.toJSONSchema(updateOrderItemSchema, {
              target: "openapi-3.0",
            }),
          },
        },
      },
      responses: {
        200: { description: "Order item updated successfully" },
        400: { description: "Invalid input or empty body" },
        404: { description: "Order item not found" },
      },
    },
    delete: {
      tags: ["Order Items"],
      summary: "Delete an order item by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: { description: "Order item deleted successfully" },
        404: { description: "Order item not found" },
      },
    },
  },
};
