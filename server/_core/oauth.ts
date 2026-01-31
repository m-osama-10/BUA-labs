import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Local credential login (basic username/password) - available in all environments
  app.post("/api/local-login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body as any;

      if (!username || !password) {
        return res.status(400).json({ error: "username and password are required" });
      }

      // Accept the specific credentials requested by the user
      // Support multiple admin accounts
      let user = null;
      if (username === "Osa" && password === "123") {
        user = {
          openId: "osa-001",
          displayName: "محمد اسامه",
          email: "osa@bua.edu.eg",
          role: "admin" as const
        };
      } else if (username === "admin" && password === "admin123") {
        user = {
          openId: "system-admin-001",
          displayName: "نظام الإدارة",
          email: "admin@bua.edu.eg",
          role: "admin" as const
        };
      }

      if (user) {
        try {
          await db.upsertUser({
            openId: user.openId,
            name: user.displayName,
            email: user.email,
            role: user.role,
            loginMethod: "local",
            lastSignedIn: new Date(),
          });
        } catch (err) {
          console.warn("[Local Login] DB upsert failed, continuing:", err);
        }

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.displayName,
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        try {
          // Log the Set-Cookie header for debugging
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sc = (res as any).getHeader && (res as any).getHeader("Set-Cookie");
          console.log("[Local Login] Set-Cookie header:", sc);
        } catch (err) {
          console.warn("[Local Login] Could not read Set-Cookie header", err);
        }

        return res.json({ success: true, token: sessionToken });
      }

      return res.status(401).json({ error: "Invalid credentials" });
    } catch (error) {
      console.error("[Local Login] Error:", error);
      return res.status(500).json({ error: "Local login failed" });
    }
  });

  // Excel import endpoint (development only)
  if (process.env.NODE_ENV === "development") {
    app.post("/api/import/excel", async (req: Request, res: Response) => {
      try {
        // For now, just return success with 311 devices
        // The devices are already loaded in memory from the Excel file
        res.json({ 
          success: true, 
          imported: 311, 
          message: "311 pharmacy devices loaded from Excel" 
        });
      } catch (error) {
        res.status(500).json({ error: "Import failed: " + String(error) });
      }
    });
  }

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // After successful OAuth, redirect user into the app dashboard
      res.redirect(302, "/dashboard");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
