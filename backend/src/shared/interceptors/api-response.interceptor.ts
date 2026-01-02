import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { ApiResponse, ApiMeta, PaginationMeta } from '../types/api-response.types';

@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode || 200;

        // For 204 No Content, return minimal response
        if (statusCode === HttpStatus.NO_CONTENT) {
          return {
            data: null,
            meta: undefined,
            status: statusCode,
          };
        }

        // Handle void/undefined responses
        if (data === null || data === undefined) {
          return {
            data: null,
            meta: undefined,
            status: statusCode,
          };
        }

        // Check if data is already paginated (has items, total, page, etc.)
        const isPaginated =
          data &&
          typeof data === 'object' &&
          'items' in data &&
          'total' in data &&
          'page' in data &&
          'limit' in data;

        let responseData: T;
        let meta: ApiMeta | undefined;

        if (isPaginated) {
          const paginatedData = data as {
            items: unknown[];
            total: number;
            page: number;
            limit: number;
            totalPages?: number;
          };

          // Return items array in data, pagination info in meta
          responseData = paginatedData.items as T;

          meta = {
            pagination: {
              page: paginatedData.page,
              limit: paginatedData.limit,
              total: paginatedData.total,
              totalPages:
                paginatedData.totalPages ||
                Math.ceil(paginatedData.total / paginatedData.limit),
            },
          } as PaginationMeta;
        } else {
          responseData = data as T;
          meta = undefined;
        }

        return {
          data: responseData,
          meta,
          status: statusCode,
        };
      }),
    );
  }
}

