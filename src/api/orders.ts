import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  getAllOrders,
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../service/orders";

export const ordersApp = new Hono();

const createOrderSchema = z.object({
  userId: z.number().int().positive().max(2147483647),
  workerId: z.number().int().positive().max(2147483647).nullable().optional(),
  status: z
    .enum(["pending", "paid", "shipped", "cancelled"])
    .default("pending"),
  address: z.string().min(1),

  items: z
    .array(
      z.object({
        bookId: z.number().int().positive().max(2147483647),
        quantity: z.number().int().positive().max(2147483647),
        unitPrice: z
          .string()
          .max(11)
          .regex(/^\d{1,8}(\.\d{1,2})?$/),
      }),
    )
    .min(1),
});

const updateOrderSchema = z.object({
  workerId: z.number().int().positive().max(2147483647).nullable().optional(),
  status: z.enum(["pending", "paid", "shipped", "cancelled"]).optional(),
  address: z.string().min(1).optional(),
});

const paramSchema = z.object({
  id: z.coerce.number().int().positive(),
});

ordersApp.get("/", async (c) => {
  return c.json(await getAllOrders());
});

ordersApp.get("/:id", zValidator("param", paramSchema), async (c) => {
  const { id } = c.req.valid("param");

  const order = await getOrderById(id);

  return order ? c.json(order) : c.text("Not Found", 404);
});

ordersApp.post("/", zValidator("json", createOrderSchema), async (c) => {
  const body = c.req.valid("json");

  const createdOrder = await createOrder(body);

  return c.json(createdOrder, 201);
});

ordersApp.patch(
  "/:id",
  zValidator("param", paramSchema),
  zValidator("json", updateOrderSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    if (Object.keys(body).length === 0) {
      return c.json(
        { success: false, error: "No data provided for update" },
        400,
      );
    }

    const updatedOrder = await updateOrder(id, body);

    if (!updatedOrder) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }

    return c.json(updatedOrder, 200);
  },
);

ordersApp.delete("/:id", zValidator("param", paramSchema), async (c) => {
  const { id } = c.req.valid("param");

  const deletedOrder = await deleteOrder(id);

  if (!deletedOrder) {
    return c.json({ success: false, error: "Order not found" }, 404);
  }

  return c.json(
    {
      success: true,
      message: `Order with ID ${id} deleted successfully`,
    },
    200,
  );
});

export const ordersSwaggerPaths = {
  "/orders": {
    get: {
      tags: ["Orders"],
      summary: "Get all orders",
      responses: {
        200: { description: "Success" },
      },
    },
    post: {
      tags: ["Orders"],
      summary: "Create a new order",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: z.toJSONSchema(createOrderSchema, {
              target: "openapi-3.0",
            }),
          },
        },
      },
      responses: {
        201: { description: "Order created successfully" },
        400: { description: "Invalid input" },
      },
    },
  },
  "/orders/{id}": {
    get: {
      tags: ["Orders"],
      summary: "Get an order by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: { description: "Order details" },
        404: { description: "Order not found" },
      },
    },
    patch: {
      tags: ["Orders"],
      summary: "Update an order by ID",
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
            schema: z.toJSONSchema(updateOrderSchema, {
              target: "openapi-3.0",
            }),
          },
        },
      },
      responses: {
        200: { description: "Order updated successfully" },
        400: { description: "Invalid input or empty body" },
        404: { description: "Order not found" },
      },
    },
    delete: {
      tags: ["Orders"],
      summary: "Delete an order by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: { description: "Order deleted successfully" },
        404: { description: "Order not found" },
      },
    },
  },
};
