#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");
const publicDir = path.join(root, "public");

if (!fs.existsSync(dist)) {
  console.warn("copy-public.js: dist/ not found, skipping.");
  process.exit(0);
}
if (!fs.existsSync(publicDir)) {
  process.exit(0);
}

function copyRecursive(srcDir, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const e of entries) {
    const src = path.join(srcDir, e.name);
    const dest = path.join(destDir, e.name);
    if (e.isFile()) {
      fs.copyFileSync(src, dest);
      console.log("Copied " + path.relative(root, src) + " -> dist/");
    } else if (e.isDirectory()) {
      copyRecursive(src, dest);
    }
  }
}
copyRecursive(publicDir, dist);
