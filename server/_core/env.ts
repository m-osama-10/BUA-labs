export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};

/**
 * Validate required environment variables at startup
 */
export function validateEnvironment() {
  const errors: string[] = [];

  if (!ENV.databaseUrl) {
    errors.push("DATABASE_URL is not configured");
  }

  if (!ENV.cookieSecret) {
    errors.push("JWT_SECRET is not configured");
  }

  if (!ENV.oAuthServerUrl) {
    errors.push("OAUTH_SERVER_URL is not configured");
  }

  if (errors.length > 0) {
    console.error("❌ Environment Validation Failed:");
    errors.forEach((error) => console.error(`   - ${error}`));
    throw new Error("Missing required environment variables");
  }

  console.log("✅ Environment validation passed");
}

