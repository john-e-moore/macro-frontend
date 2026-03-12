import { z } from "zod";

const optionalAppEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  MACRO_DB_SCHEMA: z
    .string()
    .trim()
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/)
    .default("serving"),
});

const requiredDbEnvSchema = z.object({
  PG_HOST: z.string().trim().min(1),
  PG_PORT: z.coerce.number().int().min(1).max(65535),
  PG_DATABASE: z.string().trim().min(1),
  PG_USER: z.string().trim().min(1),
  PG_PASSWORD: z.string().trim().min(1),
  PG_URL: z.string().trim().min(1),
});

export type AppEnv = z.infer<typeof optionalAppEnvSchema>;
export type DatabaseEnv = z.infer<typeof requiredDbEnvSchema>;
type EnvSource = Record<string, string | undefined>;

export function readAppEnv(source: EnvSource = process.env): AppEnv {
  return optionalAppEnvSchema.parse(source);
}

export function readDatabaseEnv(
  source: EnvSource = process.env,
): DatabaseEnv & AppEnv {
  const appEnv = readAppEnv(source);
  const dbEnv = requiredDbEnvSchema.parse(source);

  return {
    ...appEnv,
    ...dbEnv,
  };
}
