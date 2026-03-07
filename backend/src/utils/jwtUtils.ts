import jwt, { SignOptions } from "jsonwebtoken";

/**
 * Secrets (must come from environment variables)
 */
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET as string;

/**
 * Expiry configuration
 */
const ACCESS_TOKEN_EXPIRES_IN =
  (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]) || "15m";

// For quick testing you can override via `JWT_REFRESH_EXPIRES_IN` env var.
// Default for normal runs is 7 days; tests below may set a shorter value.
const REFRESH_TOKEN_EXPIRES_IN =
  (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]) || "30s";

// Parse simple duration strings like "10s", "5m", "2h", "7d" into milliseconds
const parseDurationToMs = (value: string): number => {
  const trimmed = String(value).trim();
  const m = trimmed.match(/^(\d+)(s|m|h|d)?$/i);
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  const unit = (m[2] || "s").toLowerCase();
  switch (unit) {
    case "s":
      return n * 1000;
    case "m":
      return n * 60 * 1000;
    case "h":
      return n * 60 * 60 * 1000;
    case "d":
      return n * 24 * 60 * 60 * 1000;
    default:
      return n * 1000;
  }
};

export const ACCESS_TOKEN_EXPIRES_IN_MS = parseDurationToMs(String(ACCESS_TOKEN_EXPIRES_IN));
export const REFRESH_TOKEN_EXPIRES_IN_MS = parseDurationToMs(String(REFRESH_TOKEN_EXPIRES_IN));

/**
 * Fail fast if secrets are missing
 * (important for both dev and prod)
 */
if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("JWT secrets are not defined in environment variables");
}

/**
 * JWT Payload interface
 * This is what will be attached to req.user
 */
export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

/**
 * 🔐 Generate Access Token
 */
export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

/**
 * 🔁 Generate Refresh Token
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};

/**
 * ✅ Verify Access Token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
};

/**
 * ✅ Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
};
