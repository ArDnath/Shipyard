import type { Context, Next } from 'hono';
import type { ZodError, ZodSchema } from 'zod';

// ─── Hono ContextVariableMap augmentation ─────────────────────────────────
// Tells Hono that 'validatedBody' is a valid key for c.get() / c.set().
// Without this, TypeScript resolves the key type as 'never' and rejects any
// call to c.get('validatedBody') across the entire app.

declare module 'hono' {
  interface ContextVariableMap {
    validatedBody: unknown;
  }
}

// ─── Types ─────────────────────────────────────────────────────────────────

interface ValidationIssue {
  field: string;
  message: string;
}

interface ValidationErrorResponse {
  error: 'Validation failed';
  issues: ValidationIssue[];
}

// ─── Helper ────────────────────────────────────────────────────────────────

function formatZodError(err: ZodError): ValidationIssue[] {
  return err.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join('.') : 'root',
    message: issue.message,
  }));
}

// ─── Middleware factory ────────────────────────────────────────────────────
// Validates the request body against a Zod schema.
// On success, stores the validated + transformed data at c.get('validatedBody').
// Callers cast to the specific type they expect:
//
//   app.post('/clone', validateBody(deploySchema), async (c) => {
//     const body = c.get('validatedBody') as DeployInput
//   })

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (c: Context, next: Next) => {
    // 1. Parse raw JSON — catch malformed bodies before Zod sees them
    let raw: unknown;
    try {
      raw = await c.req.json();
    } catch {
      return c.json(
        {
          error: 'Validation failed',
          issues: [{ field: 'root', message: 'Request body must be valid JSON' }],
        } satisfies ValidationErrorResponse,
        400,
      );
    }

    // 2. Run Zod schema — safeParse never throws
    const result = schema.safeParse(raw);

    if (!result.success) {
      return c.json(
        {
          error: 'Validation failed',
          issues: formatZodError(result.error),
        } satisfies ValidationErrorResponse,
        422,
      );
    }

    // 3. Store the validated (and transformed) data for the route handler
    c.set('validatedBody', result.data);

    await next();
  };
}
