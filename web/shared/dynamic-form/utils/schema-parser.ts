/* eslint-disable @typescript-eslint/no-explicit-any */
import type { z } from "zod";
import type { FieldInfo } from "@shared/dynamic-form/types";
import {
  getDefaultValueInZodStack,
  getBaseType,
  getEnumValues,
  isRequired,
} from "./zod-utils";

/**
 * Unwrap a Zod object that might be wrapped (optional, nullable, default, effects)
 */
export function unwrapSchema(schema: z.ZodAny): z.ZodObject<z.ZodRawShape> {
  if (!schema) {
    console.error("DynamicForm: Schema is null or undefined");
    throw new Error("Schema is required");
  }

  const typeName = schema._def?.typeName;

  // If it's already a ZodObject, return it
  if (typeName === "ZodObject") {
    return schema as z.ZodObject<z.ZodRawShape>;
  }

  // If it has shape property, it's likely a ZodObject
  if ("shape" in schema && typeof (schema as any).shape === "object") {
    return schema as z.ZodObject<z.ZodRawShape>;
  }

  // Handle wrapped types
  if (
    typeName === "ZodOptional" ||
    typeName === "ZodNullable" ||
    typeName === "ZodDefault"
  ) {
    const innerType = schema._def.innerType;
    if (innerType) {
      return unwrapSchema(innerType);
    }
  }

  // Handle ZodEffects
  if (typeName === "ZodEffects") {
    const innerType = schema._def.schema;
    if (innerType) {
      return unwrapSchema(innerType);
    }
  }

  // Try unwrap method if available
  if ("unwrap" in schema && typeof schema.unwrap === "function") {
    return unwrapSchema(schema.unwrap() as z.ZodAny);
  }

  // Fallback: return as is (might cause issues but better than crashing)
  console.warn("DynamicForm: Could not unwrap schema, returning as is", {
    typeName,
    schema,
  });
  return schema as z.ZodObject<any, any>;
}

/**
 * Get field type from Zod schema - use getBaseType which already handles unwrapping
 */
export function getFieldType(zodItem: z.ZodAny): string {
  // getBaseType already calls getBaseSchema which unwraps all wrapped types
  // So we can just call it directly
  const baseType = getBaseType(zodItem);

  // Debug: log if still unknown
  if (baseType === "unknown") {
    // Try to manually unwrap to see what's happening
    let current = zodItem;
    let depth = 0;
    const unwrapChain: string[] = [];

    while (current && current._def && depth < 10) {
      const typeName = current._def.typeName;
      unwrapChain.push(typeName);

      if (
        typeName === "ZodOptional" ||
        typeName === "ZodNullable" ||
        typeName === "ZodDefault"
      ) {
        current = current._def.innerType;
      } else if (typeName === "ZodEffects") {
        current = current._def.schema;
      } else {
        break;
      }
      depth++;
    }

    console.log("[getFieldType] Type is unknown", {
      originalTypeName: zodItem._def?.typeName,
      unwrapChain,
      finalTypeName: current?._def?.typeName,
      finalDef: current?._def,
    });
  }

  return baseType;
}

/**
 * Parse Zod schema to extract field information
 */
export function parseSchema(schema: z.ZodObject<z.ZodRawShape>): FieldInfo[] {
  if (!schema || !schema.shape) {
    return [];
  }

  const fields: FieldInfo[] = [];
  const shape = schema.shape;

  for (const key in shape) {
    const zodItem = shape[key];

    // Debug: log zodItem structure
    console.log(`[parseSchema] Parsing field "${key}"`, {
      hasZodItem: !!zodItem,
      hasDef: !!zodItem?._def,
      typeName: zodItem?._def?.typeName,
      zodItemKeys: zodItem ? Object.keys(zodItem) : [],
      defKeys: zodItem?._def ? Object.keys(zodItem._def) : [],
    });

    const baseType = getFieldType(zodItem);

    // Debug: log type detection for unknown types
    if (baseType === "unknown") {
      const unwrappedTypeName = (() => {
        let current = zodItem;
        let depth = 0;
        while (current && current._def && depth < 5) {
          const typeName = current._def.typeName;
          if (
            typeName === "ZodOptional" ||
            typeName === "ZodNullable" ||
            typeName === "ZodDefault"
          ) {
            current = current._def.innerType;
          } else if (typeName === "ZodEffects") {
            current = current._def.schema;
          } else {
            break;
          }
          depth++;
        }
        return current?._def?.typeName || "none";
      })();

      console.log(`[parseSchema] Unknown type for field "${key}"`, {
        originalTypeName: zodItem._def?.typeName,
        unwrappedTypeName,
        hasInnerType: !!zodItem._def?.innerType,
        hasSchema: !!zodItem._def?.schema,
      });
    }

    // Get description from schema
    const description = (zodItem._def as { description?: string })?.description;

    // Get default value
    const defaultValue = getDefaultValueInZodStack(zodItem);

    // Get enum values if applicable
    let enumValues: string[] | undefined;
    if (baseType === "enum") {
      enumValues = getEnumValues(zodItem);
    }

    // Handle nested objects
    let nestedFields: FieldInfo[] | undefined;
    if (baseType === "object" && zodItem._def?.typeName === "ZodObject") {
      nestedFields = parseSchema(zodItem as z.ZodObject<z.ZodRawShape>);
    }

    // Handle arrays with object elements
    if (baseType === "array") {
      const elementType = zodItem._def.type;
      if (elementType?._def?.typeName === "ZodObject") {
        nestedFields = parseSchema(elementType as z.ZodObject<any>);
      }
    }

    fields.push({
      name: key,
      zodItem,
      type: baseType,
      isRequired: isRequired(zodItem),
      defaultValue,
      description,
      enumValues,
      nestedFields,
    });
  }

  return fields;
}
