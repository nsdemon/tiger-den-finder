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

const files = fs.readdirSync(publicDir);
files.forEach((f) => {
  const src = path.join(publicDir, f);
  const dest = path.join(dist, f);
  if (fs.statSync(src).isFile()) {
    fs.copyFileSync(src, dest);
    console.log("Copied public/" + f + " -> dist/");
  }
});
