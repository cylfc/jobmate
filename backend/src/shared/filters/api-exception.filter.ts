import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '@shared/types/api-response.types';
import { BaseCustomException } from '@shared/exceptions/custom-exceptions';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode: string | undefined;
    let errorDetails: string | undefined;
    let errorMeta: Record<string, any> = {};

    if (exception instanceof BaseCustomException) {
      // Handle custom exceptions với error codes
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as {
        code?: string;
        message?: string;
        [key: string]: any;
      };
      errorCode = exceptionResponse.code;
      message = exceptionResponse.message || message;
      // Include additional metadata từ custom exception
      Object.keys(exceptionResponse).forEach((key) => {
        if (key !== 'code' && key !== 'message') {
          errorMeta[key] = exceptionResponse[key];
        }
      });
    } else if (exception instanceof HttpException) {
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
          code?: string;
        };
        message = Array.isArray(responseObj.message)
          ? responseObj.message.join(', ')
          : responseObj.message || responseObj.error || message;
        errorCode = responseObj.code;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorDetails = process.env.NODE_ENV === 'development' ? exception.stack : undefined;
    }

    const errorResponse: ApiResponse<null> = {
      data: null,
      meta: {
        error: {
          ...(errorCode && { code: errorCode }),
          message,
          ...(errorDetails && { details: errorDetails }),
          ...errorMeta,
          path: request.url,
          timestamp: new Date().toISOString(),
        },
      },
      status,
    };

    response.status(status).json(errorResponse);
  }
}

