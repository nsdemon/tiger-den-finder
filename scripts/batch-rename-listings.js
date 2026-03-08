#!/usr/bin/env node
/**
 * Batch-rename listing images into public/listings/ for TigerDenFinder.
 *
 * Usage:
 *   node scripts/batch-rename-listings.js <sourceDir> [options]
 *
 * Options:
 *   --target=DIR   Output directory (default: public/listings)
 *   --keep-names  Copy all images without renaming (keeps descriptive names).
 *                 Then map them in LOCAL_LISTING_PHOTO_FILES in ListingsContext.
 *   --multi        Source has subdirs 1, 2, ... 16; each can have multiple images.
 *                  Output: f1.jpg, f1-1.jpg, f1-2.jpg, f2.jpg, f2-1.jpg, ...
 *   --dry-run      Print renames without copying
 *
 * With --keep-names: copies every image file into target with original filename (no limit).
 * Without --multi or --keep-names: all image files sorted by mtime → f1.ext, f2.ext, ... f16.ext.
 *
 * With --multi: sourceDir must contain subdirs named 1, 2, 3, ... or 01, 02, ...
 * (listing index). Each subdir's images become f1.jpg, f1-1.jpg, f1-2.jpg for
 * folder "1", etc. First image in each folder is the main (fN.ext), rest are fN-1, fN-2.
 */

const fs = require("fs");
const path = require("path");

const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const ROOT = path.join(__dirname, "..");

function isImage(name) {
  const ext = path.extname(name).toLowerCase();
  return IMG_EXT.has(ext);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const sourceDir = args.find((a) => !a.startsWith("--"));
  const target = args.find((a) => a.startsWith("--target="));
  const keepNames = args.includes("--keep-names");
  const multi = args.includes("--multi");
  const dryRun = args.includes("--dry-run");
  const targetDir = target ? target.split("=")[1] : "public/listings";
  return {
    sourceDir: sourceDir ? path.resolve(ROOT, sourceDir) : null,
    targetDir: path.resolve(ROOT, targetDir),
    keepNames,
    multi,
    dryRun,
  };
}

function flatMode(sourceDir, targetDir, dryRun) {
  const names = fs.readdirSync(sourceDir);
  const files = names
    .filter((n) => {
      const p = path.join(sourceDir, n);
      return fs.statSync(p).isFile() && isImage(n);
    })
    .map((n) => ({
      name: n,
      path: path.join(sourceDir, n),
      mtime: fs.statSync(path.join(sourceDir, n)).mtimeMs,
    }))
    .sort((a, b) => a.mtime - b.mtime);

  const maxListings = 16;
  const toCopy = files.slice(0, maxListings);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  toCopy.forEach((f, i) => {
    const ext = path.extname(f.name).toLowerCase();
    const destName = `f${i + 1}${ext}`;
    const destPath = path.join(targetDir, destName);
    if (dryRun) {
      console.log(`${f.name} -> ${destName}`);
    } else {
      fs.copyFileSync(f.path, destPath);
      console.log("Copied " + path.relative(ROOT, f.path) + " -> " + path.relative(ROOT, destPath));
    }
  });
  if (files.length > maxListings) {
    console.warn(`Skipped ${files.length - maxListings} extra image(s). Only first ${maxListings} used.`);
  }
}

function multiMode(sourceDir, targetDir, dryRun) {
  const names = fs.readdirSync(sourceDir);
  const subdirs = names
    .filter((n) => {
      const p = path.join(sourceDir, n);
      return fs.statSync(p).isDirectory() && /^\d+$/.test(n);
    })
    .map((n) => parseInt(n, 10))
    .sort((a, b) => a - b);

  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  subdirs.forEach((num) => {
    const subPath = path.join(sourceDir, String(num));
    const files = fs
      .readdirSync(subPath)
      .filter((n) => {
        const p = path.join(subPath, n);
        return fs.statSync(p).isFile() && isImage(n);
      })
      .map((n) => ({
        name: n,
        path: path.join(subPath, n),
        mtime: fs.statSync(path.join(subPath, n)).mtimeMs,
      }))
      .sort((a, b) => a.mtime - b.mtime);

    const baseId = `f${num}`;
    files.forEach((f, i) => {
      const ext = path.extname(f.name).toLowerCase();
      const destName = i === 0 ? `${baseId}${ext}` : `${baseId}-${i}${ext}`;
      const destPath = path.join(targetDir, destName);
      if (dryRun) {
        console.log(`${path.relative(ROOT, f.path)} -> ${destName}`);
      } else {
        fs.copyFileSync(f.path, destPath);
        console.log("Copied " + path.relative(ROOT, f.path) + " -> " + path.relative(ROOT, destPath));
      }
    });
  });
}

function keepNamesMode(sourceDir, targetDir, dryRun) {
  const names = fs.readdirSync(sourceDir);
  const files = names.filter((n) => {
    const p = path.join(sourceDir, n);
    return fs.statSync(p).isFile() && isImage(n);
  });
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  files.forEach((name) => {
    const src = path.join(sourceDir, name);
    const dest = path.join(targetDir, name);
    if (dryRun) {
      console.log(name + " (unchanged)");
    } else {
      fs.copyFileSync(src, dest);
      console.log("Copied " + path.relative(ROOT, src) + " -> " + path.relative(ROOT, dest));
    }
  });
  console.log("\n" + files.length + " image(s) copied with original names. Map them in context/ListingsContext.tsx using LOCAL_LISTING_PHOTO_FILES (listing id -> array of filenames).");
}

function main() {
  const { sourceDir, targetDir, keepNames, multi, dryRun } = parseArgs();
  if (!sourceDir) {
    console.error("Usage: node scripts/batch-rename-listings.js <sourceDir> [--target=public/listings] [--keep-names] [--multi] [--dry-run]");
    process.exit(1);
  }
  if (!fs.existsSync(sourceDir)) {
    console.error("Source directory not found:", sourceDir);
    process.exit(1);
  }
  if (dryRun) console.log("(dry run)\n");
  if (keepNames) {
    keepNamesMode(sourceDir, targetDir, dryRun);
  } else if (multi) {
    multiMode(sourceDir, targetDir, dryRun);
  } else {
    flatMode(sourceDir, targetDir, dryRun);
  }
  if (!keepNames) {
    console.log("\nDone. Add listing ids to LOCAL_LISTING_PHOTO_IDS / LOCAL_LISTING_PHOTO_COUNTS in context/ListingsContext.tsx.");
  }
}

main();
