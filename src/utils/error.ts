import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

const PG_CODES = {
    FOREIGN_KEY_VIOLATION: "23503",
    UNIQUE_VIOLATION: "23505",
    NOT_NULL_VIOLATION: "23502",
    CHECK_VIOLATION: "23514",
} as const;

export function handleDbError(error: unknown, c: Context) {
    if (error instanceof HTTPException) {
        return c.json(
            {
                success: false,
                error: error.message,
            },
            error.status,
        );
    }

    if (error instanceof SyntaxError) {
        return c.json(
            {
                success: false,
                error: "Malformed JSON in request body",
            },
            400,
        );
    }

    const pgError = (error as any)?.cause ?? error;
    const code: string | undefined = pgError?.code;

    switch (code) {
        case PG_CODES.FOREIGN_KEY_VIOLATION:
            return c.json(
                {
                    success: false,
                    error: "Related resource does not exist",
                    detail: pgError.detail ?? null,
                },
                422,
            );

        case PG_CODES.UNIQUE_VIOLATION:
            return c.json(
                {
                    success: false,
                    error: "Record already exists",
                    detail: pgError.detail ?? null,
                },
                409,
            );

        case PG_CODES.NOT_NULL_VIOLATION:
            return c.json(
                {
                    success: false,
                    error: "Required field is missing",
                    detail: pgError.detail ?? null,
                },
                422,
            );

        case PG_CODES.CHECK_VIOLATION:
            return c.json(
                {
                    success: false,
                    error: "Value failed validation check",
                    detail: pgError.detail ?? null,
                },
                422,
            );

        default:
            console.error("Database error:", error);
            return c.json(
                { success: false, error: "Internal Server Error" },
                500,
            );
    }
}
