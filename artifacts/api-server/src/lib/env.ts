import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

const candidates = [
  path.resolve(moduleDir, "../.env"),
  path.resolve(moduleDir, "../../.env"),
  path.resolve(process.cwd(), ".env"),
];

for (const candidate of candidates) {
  if (existsSync(candidate)) {
    dotenv.config({ path: candidate });
  }
}
