import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../types/api-response.types';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorDetails: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as {
          message?: string | string[];
          error?: string;
        };
        message = Array.isArray(responseObj.message)
          ? responseObj.message.join(', ')
          : responseObj.message || responseObj.error || message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorDetails = process.env.NODE_ENV === 'development' ? exception.stack : undefined;
    }

    const errorResponse: ApiResponse<null> = {
      data: null,
      meta: {
        error: {
          message,
          ...(errorDetails && { details: errorDetails }),
          path: request.url,
          timestamp: new Date().toISOString(),
        },
      },
      status,
    };

    response.status(status).json(errorResponse);
  }
}

