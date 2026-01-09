/**
 * Query Builder Utilities
 * Common query builder helpers cho pagination và filtering
 */

import { SelectQueryBuilder } from 'typeorm';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchFilterOptions {
  search?: string;
  searchFields: string[];
}

export interface SortOptions {
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  defaultSortBy?: string;
  defaultSortOrder?: 'ASC' | 'DESC';
}

/**
 * Apply pagination to query builder
 */
export function applyPagination<T>(
  qb: SelectQueryBuilder<T>,
  options: PaginationOptions = {},
): SelectQueryBuilder<T> {
  const { page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;

  return qb.limit(limit).offset(offset);
}

/**
 * Apply search filter to query builder
 * Searches across multiple fields với ILIKE (case-insensitive)
 */
export function applySearchFilter<T>(
  qb: SelectQueryBuilder<T>,
  options: SearchFilterOptions,
): SelectQueryBuilder<T> {
  const { search, searchFields } = options;

  if (!search || !searchFields.length) {
    return qb;
  }

  const searchConditions = searchFields
    .map((field, index) => {
      const alias = qb.alias;
      return `${alias}.${field} ILIKE :search${index}`;
    })
    .join(' OR ');

  const searchParams: Record<string, string> = {};
  searchFields.forEach((_, index) => {
    searchParams[`search${index}`] = `%${search}%`;
  });

  // Use where if no existing where clause, otherwise use andWhere
  const hasExistingWhere = qb.expressionMap.wheres.length > 0;
  if (hasExistingWhere) {
    qb.andWhere(`(${searchConditions})`, searchParams);
  } else {
    qb.where(`(${searchConditions})`, searchParams);
  }

  return qb;
}

/**
 * Apply sorting to query builder
 */
export function applySorting<T>(
  qb: SelectQueryBuilder<T>,
  options: SortOptions = {},
): SelectQueryBuilder<T> {
  const {
    sortBy,
    sortOrder,
    defaultSortBy = 'createdAt',
    defaultSortOrder = 'DESC',
  } = options;

  const field = sortBy || defaultSortBy;
  const order = sortOrder || defaultSortOrder;
  const alias = qb.alias;

  // Validate field name để prevent SQL injection
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field)) {
    throw new Error(`Invalid sort field: ${field}`);
  }

  return qb.orderBy(`${alias}.${field}`, order);
}

/**
 * Execute paginated query
 * Returns paginated result với items, total, page, limit, totalPages
 */
export async function executePaginatedQuery<T>(
  qb: SelectQueryBuilder<T>,
  options: PaginationOptions = {},
): Promise<PaginationResult<T>> {
  const { page = 1, limit = 10 } = options;

  // Apply pagination
  const paginatedQb = applyPagination(qb.clone(), options);

  // Execute query và count
  const [items, total] = await paginatedQb.getManyAndCount();

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Apply enum filter to query builder
 */
export function applyEnumFilter<T>(
  qb: SelectQueryBuilder<T>,
  field: string,
  value: string | undefined,
): SelectQueryBuilder<T> {
  if (!value) {
    return qb;
  }

  const alias = qb.alias;
  const hasExistingWhere = qb.expressionMap.wheres.length > 0;

  if (hasExistingWhere) {
    qb.andWhere(`${alias}.${field} = :${field}`, { [field]: value });
  } else {
    qb.where(`${alias}.${field} = :${field}`, { [field]: value });
  }

  return qb;
}

/**
 * Apply multiple filters to query builder
 */
export function applyFilters<T>(
  qb: SelectQueryBuilder<T>,
  filters: Record<string, any>,
  filterMap?: Record<string, string>, // Map DTO field names to entity field names
): SelectQueryBuilder<T> {
  const alias = qb.alias;

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    const fieldName = filterMap?.[key] || key;
    const hasExistingWhere = qb.expressionMap.wheres.length > 0;

    if (hasExistingWhere) {
      qb.andWhere(`${alias}.${fieldName} = :${fieldName}`, { [fieldName]: value });
    } else {
      qb.where(`${alias}.${fieldName} = :${fieldName}`, { [fieldName]: value });
    }
  });

  return qb;
}
