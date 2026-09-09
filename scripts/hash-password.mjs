// Gera um hash de senha compatível com src/auth.ts (PBKDF2-SHA256, 100000 iterações).
// Uso: node scripts/hash-password.mjs "minhasenha"
import { pbkdf2Sync, randomBytes } from "node:crypto";

const senha = process.argv[2];
if (!senha) {
  console.error('Uso: node scripts/hash-password.mjs "minhasenha"');
  process.exit(1);
}

const ITERATIONS = 100_000;
const salt = randomBytes(16);
const hash = pbkdf2Sync(senha, salt, ITERATIONS, 32, "sha256");

console.log(`pbkdf2$${ITERATIONS}$${salt.toString("base64")}$${hash.toString("base64")}`);
