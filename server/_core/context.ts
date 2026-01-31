import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    console.log("[Context] Authenticating request...");
    user = await sdk.authenticateRequest(opts.req);
    console.log("[Context] User authenticated:", user?.openId);
  } catch (error) {
    // Authentication is optional for public procedures.
    console.log("[Context] Authentication failed:", String(error));
    user = null;
  }

  console.log("[Context] Returning user:", user ? user.openId : "null");
  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
