/**
 * Logger Service
 * Centralized logging service để replace console.log statements
 */

import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  LOG = 'log',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

@Injectable()
export class AppLoggerService implements NestLoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string): void {
    const ctx = context || this.context || 'Application';
    console.log(`[${ctx}] ${message}`, ...this.getAdditionalArgs(arguments));
  }

  error(message: any, trace?: string, context?: string): void {
    const ctx = context || this.context || 'Application';
    console.error(`[${ctx}] ${message}`, ...this.getAdditionalArgs(arguments));
    if (trace) {
      console.error('Trace:', trace);
    }
  }

  warn(message: any, context?: string): void {
    const ctx = context || this.context || 'Application';
    console.warn(`[${ctx}] ${message}`, ...this.getAdditionalArgs(arguments));
  }

  debug(message: any, context?: string): void {
    const ctx = context || this.context || 'Application';
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${ctx}] ${message}`, ...this.getAdditionalArgs(arguments));
    }
  }

  verbose(message: any, context?: string): void {
    const ctx = context || this.context || 'Application';
    if (process.env.NODE_ENV === 'development') {
      console.log(`[VERBOSE] [${ctx}] ${message}`, ...this.getAdditionalArgs(arguments));
    }
  }

  private getAdditionalArgs(args: IArguments): any[] {
    const additionalArgs: any[] = [];
    for (let i = 1; i < args.length; i++) {
      additionalArgs.push(args[i]);
    }
    return additionalArgs;
  }
}
