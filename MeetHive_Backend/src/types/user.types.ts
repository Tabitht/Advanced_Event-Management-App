/**
 * @module src/types/user.types.ts
 * @description holds the types declaration for the user objects
 */
import { Request } from "express";

interface AuthenticationRequest extends Request {
  user?: { id: string; email: string; role?: string };
}

interface UserData {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
}
export type { AuthenticationRequest, UserData };
