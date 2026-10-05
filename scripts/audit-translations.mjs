import fs from "node:fs";
import ts from "typescript";

const read = (name) => ts.createSourceFile(name, fs.readFileSync(name, "utf8"), ts.ScriptTarget.Latest, true);
const en = read("src/lib/i18n/en.ts");
const translations = read("src/lib/i18n/messages.ts");
const object = (node) => ts.isObjectLiteralExpression(node) ? node
  : ts.isAsExpression(node) ? object(node.expression)
  : ts.isCallExpression(node) ? object(node.arguments.at(-1)) : null;
const find = (tree, name) => {
  for (const statement of tree.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const item of statement.declarationList.declarations) {
      if (item.name.text === name) return object(item.initializer);
    }
  }
  throw new Error("Missing translation object: " + name);
};
const keys = (node) => new Set(node.properties.filter(ts.isPropertyAssignment).map((p) => p.name.text));
const english = keys(find(en, "EN"));
const locales = ["es", "fr", "de", "it", "pt", "ro", "pl", "ru", "uk", "ar", "hi", "ko", "zh", "yue", "fil", "ht", "vi"];
let total = 0;
for (const locale of locales) {
  const translated = keys(find(translations, locale));
  const missing = [...english].filter((key) => !translated.has(key));
  total += missing.length;
  console.log(`${locale}: ${translated.size}/${english.size} explicit strings; ${missing.length} inherit English`);
  if (process.argv.includes("--details")) console.log("  " + missing.join(", "));
}
console.log(`Total English fallback entries: ${total}`);
if (process.argv.includes("--strict") && total) process.exitCode = 1;
