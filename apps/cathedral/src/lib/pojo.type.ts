/**
 * Converts a type to a Plain Old JavaScript Object representation:
 * - Date fields become string (ISO serialization)
 * - Nested objects are recursively converted
 * - Functions are excluded
 *
 * Command handlers MUST return POJO<T> rather than raw entities.
 */
export type POJO<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown
    ? never
    : T[K] extends Date
      ? string
      : T[K] extends Date | undefined
        ? string | undefined
        : T[K] extends Date | null
          ? string | null
          : T[K] extends object
            ? POJO<T[K]>
            : T[K];
};
