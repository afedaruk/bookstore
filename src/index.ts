import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { booksApp, booksSwaggerPaths } from "./api/books";

const app = new Hono();

app.route("/books", booksApp);

const openApiSpecification = {
    openapi: "3.0.0",
    info: {
        title: "Bookstore API",
        version: "1.0.0",
    },
    paths: {
        ...booksSwaggerPaths,
    },
};

app.get("/doc", (c) => c.json(openApiSpecification));
app.get("/ui", swaggerUI({ url: "/doc" }));

export default app;
