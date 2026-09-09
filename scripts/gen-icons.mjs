// Gera os ícones PWA (PNG) a partir dos SVGs fonte em public/.
// Uso: node scripts/gen-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public", "static", "icons");
mkdirSync(outDir, { recursive: true });

const jobs = [
  { src: "public/icon-source.svg", sizes: [192, 512], prefix: "icon" },
  { src: "public/icon-maskable-source.svg", sizes: [192, 512], prefix: "icon-maskable" },
];

for (const job of jobs) {
  for (const size of job.sizes) {
    const outFile = path.join(outDir, `${job.prefix}-${size}.png`);
    await sharp(path.join(root, job.src)).resize(size, size).png().toFile(outFile);
    console.log(`✔ ${outFile}`);
  }
}

// apple-touch-icon (180x180, sem transparência, fundo já é sólido)
await sharp(path.join(root, "public/icon-source.svg"))
  .resize(180, 180)
  .png()
  .toFile(path.join(outDir, "apple-touch-icon.png"));
console.log("✔ apple-touch-icon.png");

// favicon
await sharp(path.join(root, "public/icon-source.svg"))
  .resize(32, 32)
  .png()
  .toFile(path.join(root, "public", "favicon.png"));
console.log("✔ favicon.png");
