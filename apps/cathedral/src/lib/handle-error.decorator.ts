import { Logger } from '@nestjs/common';

const logger = new Logger('HandleError');

/**
 * Decorator for CQRS command and query handlers.
 * Catches unhandled errors, logs them, and re-throws so NestJS
 * exception filters can handle them at the HTTP layer.
 *
 * Usage: apply to the execute() method of every handler.
 */
export function HandleError(): MethodDecorator {
  return (_target, propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value as (...args: unknown[]) => Promise<unknown>;

    descriptor.value = async function (...args: unknown[]) {
      try {
        return await original.apply(this, args);
      } catch (error) {
        logger.error(
          `Error in handler ${String(propertyKey)}: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error.stack : undefined,
        );
        throw error;
      }
    };

    return descriptor;
  };
}
