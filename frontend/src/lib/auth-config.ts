// Auth configuration for Phase 2
export const authConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  betterAuthURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:8000",
};
