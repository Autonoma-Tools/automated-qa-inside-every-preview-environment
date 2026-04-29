/**
 * Seed script for per-PR preview environments.
 *
 * Hits the preview environment's seed API to create the minimum database
 * state E2E tests rely on:
 *   - one test user with known credentials
 *   - one test organization owned by that user
 *   - one feature flag entry the suite expects to be present
 *
 * Usage:
 *   PREVIEW_URL=https://pr-123.preview.example.com \
 *   SEED_API_KEY=xxx \
 *   npx ts-node scripts/seed-preview.ts
 *
 * The seed endpoints are expected to be idempotent on the server side: if
 * the resource already exists, the API should return the existing record
 * rather than erroring. That keeps reruns of the same workflow safe.
 */

import "dotenv/config";
import fetch from "node-fetch";

interface SeedUser {
  id: string;
  email: string;
}

interface SeedOrg {
  id: string;
  name: string;
}

interface SeedFlag {
  key: string;
  enabled: boolean;
}

const PREVIEW_URL = process.env.PREVIEW_URL;
const SEED_API_KEY = process.env.SEED_API_KEY;

if (!PREVIEW_URL) {
  console.error("Missing required env var: PREVIEW_URL");
  process.exit(1);
}

if (!SEED_API_KEY) {
  console.error("Missing required env var: SEED_API_KEY");
  process.exit(1);
}

const BASE_HEADERS = {
  "content-type": "application/json",
  authorization: `Bearer ${SEED_API_KEY}`,
};

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const url = `${PREVIEW_URL}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `POST ${path} failed: ${res.status} ${res.statusText} — ${text}`
    );
  }

  return (await res.json()) as T;
}

async function seedUser(): Promise<SeedUser> {
  return postJson<SeedUser>("/api/test/seed/user", {
    email: "e2e-test@autonoma.test",
    password: "E2E-Preview-Password-2026!",
    name: "E2E Test User",
  });
}

async function seedOrg(ownerId: string): Promise<SeedOrg> {
  return postJson<SeedOrg>("/api/test/seed/organization", {
    ownerId,
    name: "E2E Test Org",
    slug: "e2e-test-org",
  });
}

async function seedFlag(): Promise<SeedFlag> {
  return postJson<SeedFlag>("/api/test/seed/feature-flag", {
    key: "e2e-preview-mode",
    enabled: true,
  });
}

async function main(): Promise<void> {
  console.log(`Seeding preview environment at ${PREVIEW_URL}`);

  const user = await seedUser();
  console.log(`  user: ${user.email} (${user.id})`);

  const org = await seedOrg(user.id);
  console.log(`  org:  ${org.name} (${org.id})`);

  const flag = await seedFlag();
  console.log(`  flag: ${flag.key} = ${flag.enabled}`);

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
