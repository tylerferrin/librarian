/**
 * Represents an authenticated user in the request context.
 * Shape mirrors the WorkOS User object so the swap from dev-stub to
 * WorkOS SDK only touches auth.guard.ts and auth.service.ts.
 */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean;
}
