import type { z } from 'zod'

/**
 * Unwrap a Zod object that might be wrapped (optional, nullable, default, effects)
 */
export function unwrapZodObject<T extends z.ZodObject<any, any>>(
  schema: z.ZodAny
): z.ZodObject<any, any> {
  if (!schema) return schema as z.ZodObject<any, any>
  
  // If it already has shape, it's likely a ZodObject
  if ('shape' in schema && typeof (schema as any).shape === 'object') {
    return schema as z.ZodObject<any, any>
  }
  
  const typeName = schema._def?.typeName
  
  if (typeName === 'ZodObject') {
    return schema as z.ZodObject<any, any>
  }
  
  // Handle wrapped types
  if (typeName === 'ZodOptional' || typeName === 'ZodNullable' || typeName === 'ZodDefault' || typeName === 'ZodEffects') {
    const innerType = schema._def.innerType || schema._def.schema
    if (innerType) {
      return unwrapZodObject(innerType)
    }
  }
  
  // Try unwrap method if available
  if ('unwrap' in schema && typeof schema.unwrap === 'function') {
    return unwrapZodObject(schema.unwrap() as z.ZodAny)
  }
  
  // Fallback: return as is (might be ZodObject already)
  return schema as z.ZodObject<any, any>
}

export function getBaseSchema<T extends z.ZodAny>(schema: T): z.ZodAny {
  if ('_def' in schema && 'innerType' in schema._def) {
    return getBaseSchema(schema._def.innerType as z.ZodAny)
  }
  if ('unwrap' in schema) {
    return getBaseSchema(schema.unwrap() as z.ZodAny)
  }
  return schema
}

/**
 * Get default value from Zod schema, handling nested objects and arrays
 */
export function getDefaultValueInZodStack(schema: z.ZodAny): any {
  if (!schema) return undefined
  
  // Check for default value
  if ('_def' in schema && schema._def.defaultValue !== undefined) {
    const defaultValue = typeof schema._def.defaultValue === 'function'
      ? schema._def.defaultValue()
      : schema._def.defaultValue
    
    // Handle Date defaults - convert to Date object if it's a date string/number
    if (defaultValue && typeof defaultValue === 'string' && !isNaN(Date.parse(defaultValue))) {
      // Check if this is a date field
      const baseType = getBaseType(schema)
      if (baseType === 'date') {
        return new Date(defaultValue)
      }
    }
    
    return defaultValue
  }

  // Recursively check inner types
  if ('innerType' in schema._def) {
    return getDefaultValueInZodStack(schema._def.innerType)
  }
  if ('schema' in schema._def) {
    return getDefaultValueInZodStack(schema._def.schema)
  }

  // Handle nested objects
  if (schema._def?.typeName === 'ZodObject') {
    const shape = (schema as z.ZodObject<any>).shape
    const defaults: Record<string, any> = {}
    let hasDefaults = false
    
    for (const key in shape) {
      const defaultValue = getDefaultValueInZodStack(shape[key])
      if (defaultValue !== undefined) {
        defaults[key] = defaultValue
        hasDefaults = true
      }
    }
    
    return hasDefaults ? defaults : undefined
  }

  // Handle arrays
  if (schema._def?.typeName === 'ZodArray') {
    const elementType = schema._def.type
    const elementDefault = getDefaultValueInZodStack(elementType)
    
    // If array has a default, return it
    if (schema._def.defaultValue !== undefined) {
      return typeof schema._def.defaultValue === 'function'
        ? schema._def.defaultValue()
        : schema._def.defaultValue
    }
    
    // Otherwise, return undefined (empty array will be initialized in component)
    return undefined
  }

  return undefined
}

export function getBaseType(schema: z.ZodAny): string {
  const baseSchema = getBaseSchema(schema)
  
  if (!baseSchema || !baseSchema._def) {
    return 'unknown'
  }

  const typeName = baseSchema._def.typeName

  if (typeName === 'ZodString') return 'string'
  if (typeName === 'ZodNumber') return 'number'
  if (typeName === 'ZodBoolean') return 'boolean'
  if (typeName === 'ZodDate') return 'date'
  if (typeName === 'ZodEnum' || typeName === 'ZodNativeEnum') return 'enum'
  if (typeName === 'ZodArray') return 'array'
  if (typeName === 'ZodObject') return 'object'

  return 'unknown'
}

export function zodToHtmlInputType(schema: z.ZodAny): string | undefined {
  const baseSchema = getBaseSchema(schema)
  const type = getBaseType(baseSchema)

  if (type === 'string') {
    const checks = baseSchema._def.checks || []
    for (const check of checks) {
      if (check.kind === 'email') return 'email'
      if (check.kind === 'url') return 'url'
    }
    return 'text'
  }

  if (type === 'number') return 'number'
  if (type === 'date') return 'date'

  return undefined
}

export function getEnumValues(schema: z.ZodAny): string[] {
  const baseSchema = getBaseSchema(schema)
  
  if (baseSchema._def.typeName === 'ZodEnum') {
    return baseSchema._def.values
  }
  
  if (baseSchema._def.typeName === 'ZodNativeEnum') {
    const enumObj = baseSchema._def.values
    return Object.values(enumObj).filter(
      (value) => typeof value === 'string'
    ) as string[]
  }

  return []
}

export function isRequired(schema: z.ZodAny): boolean {
  const baseSchema = getBaseSchema(schema)
  return !baseSchema.isOptional()
}

export function beautifyObjectName(name: string): string {
  let beautifiedName = name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')

  beautifiedName = beautifiedName.charAt(0).toUpperCase() + beautifiedName.slice(1)

  return beautifiedName
}

/**
 * Get nested value from object using dot notation path
 * Example: getNestedValue(obj, 'address.street') => obj.address.street
 */
export function getNestedValue(obj: Record<string, any>, path: string): any {
  if (!obj || !path) return undefined
  
  const keys = path.split('.')
  let value = obj
  
  for (const key of keys) {
    if (value === null || value === undefined) return undefined
    value = value[key]
  }
  
  return value
}

/**
 * Set nested value in object using dot notation path
 * Example: setNestedValue(obj, 'address.street', '123 Main St')
 */
export function setNestedValue(
  obj: Record<string, any>,
  path: string,
  value: any
): void {
  if (!obj || !path) return
  
  const keys = path.split('.')
  const lastKey = keys.pop()!
  
  let current = obj
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[lastKey] = value
}

/**
 * Extract shape from schema (handle nested objects and arrays)
 */
export function extractShape(schema: z.ZodAny): Record<string, z.ZodAny> {
  const unwrapped = unwrapZodObject(schema)
  if (unwrapped._def?.typeName === 'ZodObject') {
    return (unwrapped as z.ZodObject<any>).shape
  }
  return {}
}