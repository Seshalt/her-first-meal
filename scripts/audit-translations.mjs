import fs from "node:fs";
import ts from "typescript";

const source = fs.readFileSync("src/lib/i18n/en.ts", "utf8");
const tree = ts.createSourceFile("en.ts", source, ts.ScriptTarget.Latest, true);
let english;
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(tree) === "EN") {
    let object = node.initializer;
    if (ts.isAsExpression(object)) object = object.expression;
    english = Object.fromEntries(object.properties.filter(ts.isPropertyAssignment).map((p) => [p.name.text, p.initializer.text]));
  }
  ts.forEachChild(node, visit);
}
visit(tree);
if (!english) throw new Error("English source not found");
const locales = ["es", "fr", "de", "it", "pt", "ro", "pl", "ru", "uk", "ar", "hi", "ko", "zh", "yue", "fil", "ht", "vi"];
const placeholders = (value) => [...value.matchAll(/\{\w+\}/g)].map((m) => m[0]).sort().join("|");
let failures = 0;
for (const locale of locales) {
  const pack = JSON.parse(fs.readFileSync(`src/lib/i18n/packs/${locale}.json`, "utf8"));
  const missing = Object.keys(english).filter((key) => typeof pack[key] !== "string" || !pack[key].trim());
  const extra = Object.keys(pack).filter((key) => !(key in english));
  const invalid = Object.entries(english).filter(([key, value]) => typeof pack[key] === "string" && placeholders(pack[key]) !== placeholders(value)).map(([key]) => key);
  failures += missing.length + extra.length + invalid.length;
  console.log(`${locale}: ${Object.keys(pack).length}/${Object.keys(english).length} explicit strings; ${missing.length} missing; ${invalid.length} placeholder errors`);
  if (process.argv.includes("--details") && (missing.length || extra.length || invalid.length)) console.log({ missing, extra, invalid });
}
console.log(`Shared interface pack errors: ${failures}. This check does not prove page or editorial-content coverage.`);
if (process.argv.includes("--strict") && failures) process.exitCode = 1;

const contentSource = JSON.parse(fs.readFileSync("src/lib/i18n/content-source.json", "utf8"));
for (const locale of locales) {
  const file = `src/lib/i18n/content/${locale}.json`;
  if (!fs.existsSync(file)) { failures++; console.error(`${locale}: editorial dictionary missing`); continue; }
  const pack = JSON.parse(fs.readFileSync(file, "utf8"));
  const missing = contentSource.filter((key) => typeof pack[key] !== "string" || !pack[key].trim());
  const invalid = contentSource.filter((key) => typeof pack[key] === "string" && placeholders(pack[key]) !== placeholders(key));
  failures += missing.length + invalid.length;
  console.log(`${locale}: ${contentSource.length - missing.length}/${contentSource.length} editorial strings; ${invalid.length} placeholder errors`);
  if (process.argv.includes("--details") && (missing.length || invalid.length)) console.log({ missing, invalid });
}
if (process.argv.includes("--strict") && failures) process.exitCode = 1;
