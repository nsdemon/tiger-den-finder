# Listing photos (e.g. from Apartments.com)

Use **real listing photos** instead of default placeholders by saving images here and enabling them in code. The app supports **multiple photos per listing** (gallery in the detail modal).

## Keep descriptive names (recommended)

Names like `acadian-place-apartments-baton-rouge-la-building-photo.jpg` are great to keep: they’re clear, searchable, and easy to match to properties later.

1. **Copy into the project without renaming:**
   ```bash
   node scripts/batch-rename-listings.js path/to/your/50/photos --keep-names
   ```
   All images are copied into `public/listings/` with their current filenames.

2. **Wire them to listings in code** using **`LOCAL_LISTING_PHOTO_FILES`** in `context/ListingsContext.tsx`. Map each fallback listing id (`f1`, `f2`, …) to the exact filename(s) for that property, e.g.:
   ```ts
   const LOCAL_LISTING_PHOTO_FILES: Record<string, string[]> = {
     f1: ["acadian-place-apartments-baton-rouge-la-building-photo.jpg"],
     f2: ["goodwood-court-at-mid-city-baton-rouge-la-building-photo.jpg", "goodwood-court-at-mid-city-baton-rouge-la-interior-photo.jpg"],
     // ...
   };
   ```
   Use one filename for a single photo, or several for a gallery. The app will serve them from `/listings/` and show the gallery in the detail modal.

## Other options

- **Rename to f1, f2, …:** Run the script without `--keep-names` so the first 16 images (by mtime) become `f1.jpg` … `f16.jpg`. Then add those ids to `LOCAL_LISTING_PHOTO_IDS`.
- **Multiple photos per listing (f1, f1-1, …):** Use `--multi` with subfolders `1`, `2`, … and set `LOCAL_LISTING_PHOTO_COUNTS` for counts.
- **Manual:** Copy/rename files yourself into `public/listings/` and use either `LOCAL_LISTING_PHOTO_FILES` (descriptive names) or `LOCAL_LISTING_PHOTO_IDS` + `LOCAL_LISTING_PHOTO_COUNTS` (f1/f2 convention).

### Script options

```bash
node scripts/batch-rename-listings.js <sourceDir> [--target=public/listings] [--keep-names] [--multi] [--dry-run]
```

- `--keep-names` – Copy all images without renaming (recommended for descriptive names).
- `--target=DIR` – Output directory (default: `public/listings`).
- `--multi` – Source has subdirs `1`, `2`, … `16`; output f1.jpg, f1-1.jpg, …
- `--dry-run` – Print what would happen without copying.

```bash
npm run rename-listings -- path/to/downloaded/images
npm run rename-listings -- path/to/photos -- --keep-names
```

## Listing ID → property name (fallback listings)

| File name(s)      | Property name              |
|-------------------|----------------------------|
| f1.jpg, f1-1…     | The Ogden on Highland      |
| f2.jpg, f2-1…     | Nicholson Gateway          |
| f3.jpg            | Stadium View Lofts          |
| f4.jpg            | Magnolia Commons            |
| f5.jpg            | Purple Pines Apartments     |
| f6.jpg            | The Varsity Baton Rouge     |
| f7.jpg            | Cloverland Commons          |
| f8.jpg            | The Beau Rivage             |
| f9.jpg            | Tiger Crossing Apartments   |
| f10.jpg           | LSU Courtyard Studios      |
| f11.jpg           | Perkins Place Townhomes     |
| f12.jpg           | The Highland House          |
| f13.jpg           | South Campus Flats          |
| f14.jpg           | Brightside Village          |
| f15.jpg           | The Chimes Street Lofts     |
| f16.jpg           | Steele Blvd Suites         |
