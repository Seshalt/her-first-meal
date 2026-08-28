#!/usr/bin/env node
/**
 * Post-`vite build` fixes for the Nitro vercel output that otherwise 500 on
 * every HTML route as `{ error: true, status: 500, unhandled: true }`.
 *
 * 1. Rolldown re-exports a missing `ssr_exports` binding from the Start SSR
 *    chunk. Node throws `SyntaxError: Export 'ssr_exports' is not defined`.
 *    Nitro's ssr-renderer loads `ssr.mjs` export `a` and calls `.fetch`.
 *    The real entry is `server_default` (`{ fetch }`). Point `a` at that.
 *
 * 2. PGLite's wasm/data files are hashed into `static/assets/` but the
 *    bundled `@electric-sql/pglite` looks for `pglite.wasm`, `pglite.data`,
 *    and `initdb.wasm` next to `electric-sql__pglite.mjs`. Copy them in.
 */
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const func = join(root, ".vercel/output/functions/__server.func");
const ssrDir = join(func, "_ssr");
const libsDir = join(func, "_libs");

function patchSsrExports() {
  if (!existsSync(ssrDir)) {
    console.log("[patch-vercel] no _ssr dir — skip export rewrite");
    return;
  }
  let patched = 0;
  for (const name of readdirSync(ssrDir)) {
    if (!name.startsWith("ssr") || !name.endsWith(".mjs")) continue;
    const path = join(ssrDir, name);
    const before = readFileSync(path, "utf8");
    const after = before.replace(/\bssr_exports as a\b/g, "server_default as a");
    if (after !== before) {
      writeFileSync(path, after);
      patched += 1;
      console.log(`[patch-vercel] wired server_default as ssr entry in ${name}`);
    }
  }
  if (!patched) {
    console.log("[patch-vercel] no ssr_exports re-export found (already clean)");
  }
}

function copyPgliteAssets() {
  if (!existsSync(libsDir)) {
    console.log("[patch-vercel] no _libs dir — skip pglite copy");
    return;
  }

  const here = dirname(fileURLToPath(import.meta.url));
  const dist = join(here, "../node_modules/@electric-sql/pglite/dist");
  const names = ["pglite.wasm", "pglite.data", "initdb.wasm"];
  let copied = 0;
  for (const name of names) {
    const src = join(dist, name);
    const dest = join(libsDir, name);
    if (!existsSync(src)) {
      console.warn(`[patch-vercel] missing ${src}`);
      continue;
    }
    copyFileSync(src, dest);
    copied += 1;
    console.log(`[patch-vercel] copied ${name} into function _libs`);
  }

  if (copied < names.length) {
    // Fallback: hashed copies from the client asset folder.
    const assets = join(root, ".vercel/output/static/assets");
    if (existsSync(assets)) {
      const files = readdirSync(assets);
      const map = [
        [/^pglite-.*\.data$/, "pglite.data"],
        [/^pglite-.*\.wasm$/, "pglite.wasm"],
        [/^initdb-.*\.wasm$/, "initdb.wasm"],
      ];
      for (const [re, destName] of map) {
        const dest = join(libsDir, destName);
        if (existsSync(dest)) continue;
        const hit = files.find((f) => re.test(f));
        if (!hit) continue;
        copyFileSync(join(assets, hit), dest);
        console.log(`[patch-vercel] copied ${hit} → _libs/${destName}`);
      }
    }
  }
}

patchSsrExports();
copyPgliteAssets();
