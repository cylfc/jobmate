/* eslint-disable @typescript-eslint/no-explicit-any */
import type { z } from "zod";
import { getDefaultValueInZodStack } from "./zod-utils";

/**
 * Get nested value from object using dot notation path
 */
export function getFormValue(
  obj: Record<string, unknown>,
  path: string,
): unknown {
  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

/**
 * Set nested value in object using dot notation path
 */
export function setFormValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  const keys = path.split(".");
  const lastKey = keys.pop()!;

  let current: Record<string, unknown> = obj;
  for (const key of keys) {
    if (
      current[key] === null ||
      current[key] === undefined ||
      typeof current[key] !== "object"
    ) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[lastKey] = value;
}

/**
 * Get initial values from schema defaults
 */
export function getInitialValues(
  schema: z.ZodObject<z.ZodRawShape>,
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  if (!schema || !schema.shape) return values;

  const shape = schema.shape;

  for (const key in shape) {
    const defaultValue = getDefaultValueInZodStack(shape[key]);
    // Always set key, even if undefined, to ensure formState has all keys for validation
    values[key] = defaultValue !== undefined ? defaultValue : undefined;
  }

  return values;
}
