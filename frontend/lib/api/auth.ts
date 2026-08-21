import type { User, UserRole, ApiError } from '@/types';
import { mockUsers } from '@/lib/mock/data';
import { delay, delayError, ApiRequestError, validationError } from './client';

// ---------------------------------------------------------------------------
// Mock auth service.
//
// Today: in-memory session backed by mock users. Every password is accepted
// (this is a frontend prototype — no real credentials exist).
//
// Tomorrow: swap these functions for HTTP-only cookie auth against the Go
// backend. The function signatures are intentionally shaped like the future
// REST contract (POST /auth/login, GET /auth/me, POST /auth/logout) so the
// UI never changes — only the implementation below.
// ---------------------------------------------------------------------------

// Roles surfaced on the login screen as demo shortcuts.
export const LOGIN_ROLES: {
  role: UserRole;
  label: string;
  description: string;
  identifier: string;
}[] = [
  {
    role: 'bmu_officer',
    label: 'BMU staff',
    description: 'Inspect batches & manage landing sites',
    identifier: 's.were@bmu.aquaseal',
  },
  {
    role: 'fisher',
    label: 'Fisher',
    description: 'Record landings & list fish for sale',
    identifier: 'j.otieno@fisher.aquaseal',
  },
  {
    role: 'buyer',
    label: 'Buyer',
    description: 'Browse listings & request purchases',
    identifier: 'd.kiprop@buyers.aquaseal',
  },
  {
    role: 'admin',
    label: 'Admin',
    description: 'Full system oversight & configuration',
    identifier: 'g.achieng@county.aquaseal',
  },
];

// In-memory session — stands in for the future HTTP-only cookie.
let sessionUser: User | null = null;

const USERS_BY_ID: Map<string, User> = new Map(
  mockUsers.map((u) => [u.id, u])
);

// Accept email or phone as the identifier.
function findUser(identifier: string): User | undefined {
  const normalized = identifier.trim().toLowerCase();
  return mockUsers.find(
    (u) =>
      u.email.toLowerCase() === normalized ||
      (u.phone ?? '').toLowerCase() === normalized
  );
}

export interface SignInInput {
  identifier: string; // email or phone
  password: string;
}

export interface AuthSession {
  user: User;
}

export async function signIn(input: SignInInput): Promise<AuthSession> {
  const identifier = input.identifier.trim();

  if (!identifier) {
    return delayError(validationError('Enter your email or phone number.'));
  }
  if (!input.password) {
    return delayError(validationError('Enter your password.'));
  }

  const user = findUser(identifier);
  // Simulate the latency of a real auth round-trip.
  if (!user) {
    return delayError(
      new ApiRequestError({
        code: 'invalid_credentials',
        message: 'No account found with that email or phone number.',
        status: 401,
      })
    );
  }
  // In this prototype every password is accepted.
  sessionUser = user;
  return delay({ user }, 800);
}

export async function getCurrentUser(): Promise<User | null> {
  if (sessionUser) return delay({ ...sessionUser }, 120);
  // Default to the BMU demo user so the app shell works without an explicit
  // login during prototyping — still structured so a 401 returns null later.
  const fallback = mockUsers.find((u) => u.role === 'bmu_officer')!;
  sessionUser = fallback;
  return delay({ ...fallback }, 120);
}

export async function signOut(): Promise<void> {
  sessionUser = null;
  return delay(undefined, 200);
}

export { ApiRequestError };
export type { ApiError };
