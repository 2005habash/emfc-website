// Fails when site text contains a middle dot (·) or an em dash (—), which the club's copy rules ban.
// Usage: npm run lint:copy
// Scans the code and data in src/ that the site renders; developer notes (.md), code comments and the
// stock UI kit are skipped.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["src"];
const skip = [join("src", "components", "ui"), join("src", "routeTree.gen.ts")];
const banned = /[·—]/;

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (skip.some((s) => path.startsWith(s))) continue;
    if (statSync(path).isDirectory()) yield* files(path);
    else if (/\.(tsx?|css|json)$/.test(name)) yield path;
  }
}

const isComment = (line) => /^\s*(\/\/|\/?\*|\{\/\*)/.test(line);
const found = [];
for (const root of roots) {
  for (const file of files(root)) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (banned.test(line) && !isComment(line)) found.push(`${file}:${i + 1}: ${line.trim().slice(0, 120)}`);
      });
  }
}

if (found.length) {
  console.error(`Middle dots or em dashes in site text (${found.length}):\n${found.join("\n")}`);
  console.error("Use a comma, a colon or two sentences instead.");
  process.exit(1);
}
console.log("Copy check passed: no middle dots or em dashes in site text.");
