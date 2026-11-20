import "dotenv/config";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const env = {
  port: Number(process.env.PORT ?? 3000),
  mongoUri: required("MONGO_URI"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: required("JWT_EXPIRES_IN"),
  // Comma-separated list of allowed frontend origins; "*" when unset.
  corsOrigin: process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()) ?? "*",
} as const;
