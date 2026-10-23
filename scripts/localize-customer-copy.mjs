import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const SOURCE_PATH = "src/lib/i18n/content-source.json";
const sourceStrings = new Set();
const templateStrings = new Set();
const ignoredNames = new Set(["Her First Meal", "Maat", "Google", "Instagram", "TikTok", "Publix", "Walmart", "Aldi", "Kroger", "Costco", "Whole Foods", "Trader Joe's", "Sprouts", "Zoom", "Stripe", "YouTube", "USD", "X"]);
function human(value) {
  const s = value.trim();
  if (new Set("any low medium steady walking stretching mobility yoga breathing pelvic strength recovery confirmed cancelled completed pending paid unpaid refunded front side back left right cup cups tbsp tsp oz lb g kg ml l can cans clove cloves bunch pinch piece pieces slice slices serving servings energy min vegan vegetarian pescatarian halal kosher gluten-free dairy-free nut-free soy-free".split(" ")).has(s)) return true;
  if (!s || s.length > 2400 || ignoredNames.has(s) || !/[A-Za-z]/.test(s)) return false;
  if (/^(?:https?:|mailto:|tel:|@|[/\.#]\S)/.test(s) || /\S+@\S+\.\S+/.test(s)) return false;
  if (/(?:\b(?:bg|text|font|border|rounded|shadow|size|gap|px|py|mt|mb|max-w|min-h|grid-cols|items|justify)-|(?:sm|md|lg|xl):|^\w+\/\w+)/.test(s)) return false;
  if (/^[\w./:$#{}()[\]<>+=,;?-]+$/.test(s) && !/^[A-Z][a-z]+(?:[-'][a-z]+)?$/.test(s) && !/^[A-Z]{2,15}$/.test(s)) return false;
  return /[A-Za-z]{2}/.test(s);
}
function keep(value) { if (human(value)) sourceStrings.add(value.trim()); if (value.includes("\n")) for (const line of value.split("\n")) if (human(line)) sourceStrings.add(line.trim()); }
function decode(value) {
  const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", mdash: "—", ndash: "–" };
  return value.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (all, name) => name[0] === "#" ? String.fromCodePoint(name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10)) : entities[name] ?? all);
}
function jsxText(value) {
  const lines = value.replace(/\t/g, " ").split(/\r\n|\n|\r/);
  return decode(lines.map((line, i) => {
    if (i) line = line.replace(/^ +/, "");
    if (i < lines.length - 1) line = line.replace(/ +$/, "");
    return line;
  }).filter(Boolean).join(" "));
}
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
const customerFiles = [...files("src/routes"), ...files("src/components"), ...files("src/lib/auth")].filter((file) => file.endsWith(".tsx") && !file.includes("/admin") && !file.endsWith("/hearth.tsx") && !file.includes("/preview-host") && !file.includes("/visual-overrides"));
const dataFiles = [...files("src/lib/content"), ...files("src/lib/server"), ...files("src/lib/auth"), "src/lib/site.ts", "src/lib/landing.ts", "src/lib/i18n/en.ts"].filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts") && !/\/(admin|atelier-ai|openai)\.ts$/.test(file));
let changed = 0;
for (const file of [...new Set([...customerFiles, ...dataFiles])]) {
  const contents = fs.readFileSync(file, "utf8");
  const tree = ts.createSourceFile(file, contents, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const edits = [];
  const canEdit = customerFiles.includes(file) && !contents.includes('useContentText');
  let usesText = false;
  function walk(node, active = false, parentTag = "") {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;
    if (ts.isTaggedTemplateExpression(node)) return;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) keep(node.text);
    if (ts.isTemplateExpression(node)) {
      const template = node.head.text + node.templateSpans.map((span, i) => `{v${i}}` + span.literal.text).join("");
      if (human(template) && template.replace(/\{v\d+\}/g, "").trim().length >= 4) { keep(template); templateStrings.add(template.trim()); }
    }
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
      const name = node.name?.text || (ts.isVariableDeclaration(node.parent) ? node.parent.name.getText(tree) : "");
      if (/^[A-Z]/.test(name) && node.body && /<\/?[A-Za-z>]/.test(node.body.getText(tree))) {
        active = true;
        if (canEdit) {
          if (ts.isBlock(node.body)) edits.push({ start: node.body.getStart(tree) + 1, end: node.body.getStart(tree) + 1, value: "\n  const localizeContent = useContentText();" });
          else {
            edits.push({ start: node.body.getStart(tree), end: node.body.getStart(tree), value: "{ const localizeContent = useContentText(); return " });
            edits.push({ start: node.body.getEnd(), end: node.body.getEnd(), value: "; }" });
          }
          usesText = true;
        }
      }
    }
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = ts.isJsxElement(node) ? node.openingElement.tagName.getText(tree) : node.tagName.getText(tree);
      ts.forEachChild(node, (child) => walk(child, active, tag));
      return;
    }
    if (ts.isJsxText(node)) {
      const value = jsxText(node.text);
      keep(value);
      if (canEdit && active && /[A-Za-z]/.test(value) && !["script", "style", "title"].includes(parentTag)) {
        edits.push({ start: node.getStart(tree), end: node.getEnd(), value: `{localizeContent(${JSON.stringify(value)})}` });
      }
    }
    if (canEdit && active && ts.isJsxExpression(node) && node.expression && !node.dotDotDotToken && !["script", "style", "title"].includes(parentTag)) {
      const attribute = ts.isJsxAttribute(node.parent) ? node.parent.name.getText(tree) : null;
      if (!attribute || /^(alt|title|placeholder|aria-label|label|body|kicker|subtitle|description|sectionLabel|ctaText|emptyLabel)$/.test(attribute)) {
        edits.push({ start: node.expression.getStart(tree), end: node.expression.getStart(tree), value: "localizeContent(" });
        edits.push({ start: node.expression.getEnd(), end: node.expression.getEnd(), value: ")" });
      }
    }
    if (canEdit && active && ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer) && /^(alt|title|placeholder|aria-label|label|body|kicker|subtitle|description|sectionLabel|ctaText|emptyLabel)$/.test(node.name.getText(tree))) {
      const value = decode(node.initializer.text);
      keep(value);
      if (human(value)) edits.push({ start: node.initializer.getStart(tree), end: node.initializer.getEnd(), value: `{localizeContent(${JSON.stringify(value)})}` });
    }
    if (canEdit && active && ts.isCallExpression(node) && /^toast\.(success|error|message|info|warning)$/.test(node.expression.getText(tree)) && node.arguments[0]) {
      const argument = node.arguments[0];
      edits.push({ start: argument.getStart(tree), end: argument.getStart(tree), value: "localizeContent(" });
      edits.push({ start: argument.getEnd(), end: argument.getEnd(), value: ")" });
    }
    ts.forEachChild(node, (child) => walk(child, active, parentTag));
  }
  walk(tree);
  if (canEdit && usesText && process.argv.includes("--apply")) {
    let result = contents;
    for (const edit of edits.sort((a, b) => b.start - a.start || b.end - a.end)) result = result.slice(0, edit.start) + edit.value + result.slice(edit.end);
    fs.writeFileSync(file, 'import { useText as useContentText } from "@/lib/i18n/use-text";\n' + result);
    changed++;
  }
}
fs.writeFileSync(SOURCE_PATH, JSON.stringify([...sourceStrings].sort(), null, 2) + "\n");
console.log(JSON.stringify({ strings: sourceStrings.size, templates: templateStrings.size, changed, files: customerFiles.length }));
