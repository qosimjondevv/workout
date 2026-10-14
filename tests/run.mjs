import { readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

// Sodda test yuguruvchi: tashqi kutubxonasiz, faqat node:assert.
// Sinaladigan narsa — SOF mantiq (utils/, constants/), ya'ni React ham,
// Firebase ham talab qilinmaydi va test bir soniyada tugaydi.
const here = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(here)
  .filter((f) => f.endsWith(".test.mjs"))
  .sort();

let failed = 0;

for (const file of files) {
  try {
    await import(pathToFileURL(join(here, file)).href);
  } catch (e) {
    failed += 1;
    console.error("XATO: " + file);
    console.error(e.message);
  }
}

console.log("");
console.log(files.length + " ta to'plam, xato: " + failed);
process.exit(failed ? 1 : 0);
