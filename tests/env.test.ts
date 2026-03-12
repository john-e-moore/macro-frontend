import { describe, expect, it } from "vitest";

import { readAppEnv, readDatabaseEnv } from "@/lib/env";

describe("environment parsing", () => {
  it("applies app defaults", () => {
    expect(readAppEnv({})).toEqual({
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      MACRO_DB_SCHEMA: "serving",
    });
  });

  it("parses the db env lazily", () => {
    expect(
      readDatabaseEnv({
        PG_HOST: "localhost",
        PG_PORT: "5432",
        PG_DATABASE: "macro",
        PG_USER: "readonly_user",
        PG_PASSWORD: "secret",
        PG_URL: "postgresql://readonly_user:secret@localhost:5432/macro",
      }),
    ).toMatchObject({
      PG_HOST: "localhost",
      PG_PORT: 5432,
      MACRO_DB_SCHEMA: "serving",
    });
  });

  it("rejects unsafe schema names", () => {
    expect(() =>
      readAppEnv({
        MACRO_DB_SCHEMA: "serving;drop schema public;",
      }),
    ).toThrow();
  });
});
