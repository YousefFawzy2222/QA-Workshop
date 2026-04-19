// ─── In-Memory User Store ────────────────────────────────────────────────────
// UA-FR-04: The user's email address serves as their unique ID in the system.

export interface User {
  email: string;        // unique identifier
  passwordHash: string;
  isAdmin: boolean;
}

// Singleton in-memory store (resets on server restart – no DB for this phase)
const users: User[] = [];

export const UserStore = {
  /** Find a user by email (case-insensitive) */
  findByEmail(email: string): User | undefined {
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  /** Add a new user */
  add(user: User): void {
    users.push(user);
  },

  /** Check if an email already exists */
  emailExists(email: string): boolean {
    return users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  },
};
