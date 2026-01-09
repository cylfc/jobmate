/**
 * Custom Exceptions
 * Custom exception classes với error codes cho consistent error handling
 */

import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorResponse {
  code: string;
  message: string;
  [key: string]: any;
}

/**
 * Base custom exception với error code
 */
export abstract class BaseCustomException extends HttpException {
  constructor(
    response: ErrorResponse,
    status: HttpStatus,
  ) {
    super(response, status);
  }

  getErrorCode(): string {
    const response = this.getResponse();
    if (typeof response === 'object' && response !== null && 'code' in response) {
      return (response as ErrorResponse).code;
    }
    return 'UNKNOWN_ERROR';
  }
}

/**
 * Entity not found exception
 */
export class EntityNotFoundException extends BaseCustomException {
  constructor(entityName: string, id: string) {
    super(
      {
        code: 'ENTITY_NOT_FOUND',
        message: `${entityName} with ID ${id} not found`,
        entityName,
        id,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Access denied exception
 */
export class AccessDeniedException extends BaseCustomException {
  constructor(message: string = 'Access denied', resource?: string) {
    super(
      {
        code: 'ACCESS_DENIED',
        message,
        ...(resource && { resource }),
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Ownership exception
 */
export class OwnershipException extends BaseCustomException {
  constructor(entityName: string, action: string = 'access') {
    super(
      {
        code: 'OWNERSHIP_REQUIRED',
        message: `You can only ${action} your own ${entityName.toLowerCase()}`,
        entityName,
        action,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Validation exception
 */
export class ValidationException extends BaseCustomException {
  constructor(message: string, errors?: Record<string, string[]>) {
    super(
      {
        code: 'VALIDATION_ERROR',
        message,
        ...(errors && { errors }),
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Conflict exception với error code
 */
export class ConflictException extends BaseCustomException {
  constructor(message: string, resource?: string) {
    super(
      {
        code: 'RESOURCE_CONFLICT',
        message,
        ...(resource && { resource }),
      },
      HttpStatus.CONFLICT,
    );
  }
}
