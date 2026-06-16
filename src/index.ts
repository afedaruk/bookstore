import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { booksApp, booksSwaggerPaths } from "./api/books";
import { handleDbError } from "./utils/error";
import { categoriesApp, categoriesSwaggerPaths } from "./api/categories";
import { reportsApp, reportsSwaggerPaths } from "./api/reports";
import { usersApp, usersSwaggerPaths } from "./api/users";
import { ordersApp, ordersSwaggerPaths } from "./api/orders";
import { orderItemsApp, orderItemsSwaggerPaths } from "./api/orderItems";
import { transactionsApp, transactionsSwaggerPaths } from "./api/transactions";

const app = new Hono();

app.route("/books", booksApp);

app.route("/categories", categoriesApp);

app.route("/reports", reportsApp);

app.route("/users", usersApp);

app.route("/orders", ordersApp);

app.route("/order-items", orderItemsApp);

app.route("/transactions", transactionsApp);

app.onError((err, c) => {
  return handleDbError(err, c);
});

const openApiSpecification = {
  openapi: "3.0.0",
  info: {
    title: "Bookstore API",
    version: "1.0.0",
  },
  paths: {
    ...booksSwaggerPaths,
    ...categoriesSwaggerPaths,
    ...usersSwaggerPaths,
    ...ordersSwaggerPaths,
    ...orderItemsSwaggerPaths,
    ...transactionsSwaggerPaths,
    ...reportsSwaggerPaths,
  },
};

app.get("/doc", (c) => c.json(openApiSpecification));
app.get("/ui", swaggerUI({ url: "/doc" }));

export default app;
