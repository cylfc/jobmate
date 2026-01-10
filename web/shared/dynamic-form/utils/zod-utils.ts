/* eslint-disable @typescript-eslint/no-explicit-any */
import type { z } from "zod";

/**
 * Get base schema by unwrapping all wrapped types
 */
export function getBaseSchema<T extends z.ZodAny>(schema: T): z.ZodAny {
  if (!schema) return schema;

  // Check if schema has _def property
  if (!("_def" in schema) || !schema._def) {
    console.warn("[getBaseSchema] Schema does not have _def property", {
      schema,
      schemaKeys: Object.keys(schema),
      schemaType: typeof schema,
    });
    return schema;
  }

  const typeName = schema._def.typeName;

  // Check for innerType (ZodOptional, ZodNullable, ZodDefault)
  if (
    typeName === "ZodOptional" ||
    typeName === "ZodNullable" ||
    typeName === "ZodDefault"
  ) {
    if ("innerType" in schema._def && schema._def.innerType) {
      return getBaseSchema(schema._def.innerType as z.ZodAny);
    }
  }

  // Check for schema property (ZodEffects)
  if (typeName === "ZodEffects") {
    if ("schema" in schema._def && schema._def.schema) {
      return getBaseSchema(schema._def.schema as z.ZodAny);
    }
  }

  // Also check generic innerType property (fallback)
  if ("innerType" in schema._def && schema._def.innerType) {
    return getBaseSchema(schema._def.innerType as z.ZodAny);
  }

  // Try unwrap method if available
  if ("unwrap" in schema && typeof schema.unwrap === "function") {
    return getBaseSchema(schema.unwrap() as z.ZodAny);
  }

  return schema;
}

/**
 * Get base type from Zod schema
 */
export function getBaseType(schema: z.ZodAny): string {
  const baseSchema = getBaseSchema(schema);

  if (!baseSchema || !baseSchema._def) {
    return "unknown";
  }

  const typeName = baseSchema._def.typeName;

  if (typeName === "ZodString") return "string";
  if (typeName === "ZodNumber") return "number";
  if (typeName === "ZodBoolean") return "boolean";
  if (typeName === "ZodDate") return "date";
  if (typeName === "ZodEnum" || typeName === "ZodNativeEnum") return "enum";
  if (typeName === "ZodArray") return "array";
  if (typeName === "ZodObject") return "object";

  return "unknown";
}

/**
 * Get default value from Zod schema, handling nested objects and arrays
 */
export function getDefaultValueInZodStack(schema: z.ZodAny): unknown {
  if (!schema) return undefined;

  // Check for default value
  if ("_def" in schema && schema._def.defaultValue !== undefined) {
    const defaultValue =
      typeof schema._def.defaultValue === "function"
        ? schema._def.defaultValue()
        : schema._def.defaultValue;

    // Handle Date defaults - convert to Date object if it's a date string/number
    if (
      defaultValue &&
      typeof defaultValue === "string" &&
      !isNaN(Date.parse(defaultValue))
    ) {
      // Check if this is a date field
      const baseType = getBaseType(schema);
      if (baseType === "date") {
        return new Date(defaultValue);
      }
    }

    return defaultValue;
  }

  // Recursively check inner types
  if ("innerType" in schema._def) {
    return getDefaultValueInZodStack(schema._def.innerType);
  }
  if ("schema" in schema._def) {
    return getDefaultValueInZodStack(schema._def.schema);
  }

  // Handle nested objects
  if (schema._def?.typeName === "ZodObject") {
    const shape = (schema as z.ZodObject<z.ZodRawShape>).shape;
    const defaults: Record<string, unknown> = {};
    let hasDefaults = false;

    for (const key in shape) {
      const defaultValue = getDefaultValueInZodStack(shape[key]);
      if (defaultValue !== undefined) {
        defaults[key] = defaultValue;
        hasDefaults = true;
      }
    }

    return hasDefaults ? defaults : undefined;
  }

  // Handle arrays
  if (schema._def?.typeName === "ZodArray") {
    // If array has a default, return it
    if (schema._def.defaultValue !== undefined) {
      return typeof schema._def.defaultValue === "function"
        ? schema._def.defaultValue()
        : schema._def.defaultValue;
    }

    // Otherwise, return undefined (empty array will be initialized in component)
    return undefined;
  }

  return undefined;
}

/**
 * Get enum values from Zod schema
 */
export function getEnumValues(schema: z.ZodAny): string[] {
  const baseSchema = getBaseSchema(schema);

  if (!baseSchema || !baseSchema._def) {
    return [];
  }

  const typeName = baseSchema._def.typeName;

  if (typeName === "ZodEnum") {
    return baseSchema._def.values || [];
  }

  if (typeName === "ZodNativeEnum") {
    const enumObject = baseSchema._def.values;
    if (enumObject && typeof enumObject === "object") {
      return Object.values(enumObject).filter(
        (v): v is string => typeof v === "string",
      );
    }
  }

  return [];
}

/**
 * Check if a Zod schema field is required
 */
export function isRequired(schema: z.ZodAny): boolean {
  if (!schema || !schema._def) return true;

  const typeName = schema._def.typeName;

  // If it's optional or nullable, it's not required
  if (typeName === "ZodOptional" || typeName === "ZodNullable") {
    return false;
  }

  // Check inner type if it's a default (default doesn't make it optional)
  if (typeName === "ZodDefault") {
    if (schema._def.innerType) {
      return isRequired(schema._def.innerType);
    }
  }

  // Check inner type if it's an effect
  if (typeName === "ZodEffects") {
    if (schema._def.schema) {
      return isRequired(schema._def.schema);
    }
  }

  return true;
}

/**
 * Convert Zod schema to HTML input type
 */
export function zodToHtmlInputType(schema: z.ZodAny): string | undefined {
  const baseSchema = getBaseSchema(schema);
  const type = getBaseType(baseSchema);

  if (type === "string") {
    const checks = baseSchema._def.checks || [];
    for (const check of checks) {
      if (check.kind === "email") return "email";
      if (check.kind === "url") return "url";
    }
    return "text";
  }

  if (type === "number") return "number";
  if (type === "date") return "date";

  return undefined;
}

/**
 * Beautify object name (camelCase, snake_case, kebab-case to Title Case)
 */
export function beautifyObjectName(name: string): string {
  // Convert camelCase, snake_case, kebab-case to Title Case
  return name
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/[-_]/g, " ") // Replace hyphens and underscores with spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
