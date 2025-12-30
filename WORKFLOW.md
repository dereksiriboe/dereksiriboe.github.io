# Website Workflow Guide

## Overview

Your website (cocoyams.com) has been restructured with a simple 3-page layout:

1. **Homepage** - Single hero image only
2. **natural** - All natural photos in one page
3. **project** - Professional projects organized by folder
4. **bonus** - Bonus projects organized by folder

## Folder Structure

### Desktop Folders (Where you organize photos)
```
~/Desktop/
├── natural/          # All natural photos go here
├── project/          # Organize into subfolders by project
│   ├── project-1/
│   ├── project-2/
│   └── ...
└── bonus/            # Organize into subfolders by category
    ├── category-1/
    ├── category-2/
    └── ...
```

### Repository Structure (Synced from Desktop)
```
dereksiriboe.github.io/
├── images/
│   ├── hero/         # Hero image for homepage
│   ├── natural/      # Natural photos (synced from Desktop)
│   ├── project/      # Project photos (synced from Desktop)
│   └── bonus/        # Bonus photos (synced from Desktop)
├── data/
│   ├── natural.json  # Auto-generated
│   ├── manifest.json # Auto-generated (lists subfolders)
│   ├── project-*.json # Auto-generated for each project folder
│   └── bonus-*.json   # Auto-generated for each bonus folder
└── sync-images.sh    # Script to sync Desktop → Repository
```

## How to Add/Update Photos

### Step 1: Organize photos on Desktop

**For NATURAL photos:**
- Just drop all photos into `~/Desktop/natural/`
- No organization needed - they'll display in random order

**For PROJECT photos:**
- Create a subfolder for each project in `~/Desktop/project/`
- Example: `~/Desktop/project/fashion-shoot/`
- Add photos to that subfolder
- Each subfolder becomes a navigation item on the site

**For BONUS photos:**
- Create a subfolder for each category in `~/Desktop/bonus/`
- Example: `~/Desktop/bonus/behind-the-scenes/`
- Add photos to that subfolder
- Each subfolder becomes a navigation item on the site

### Step 2: Run the sync script

From the repository directory:
```bash
cd /Users/derek/cocoyams.com/dereksiriboe.github.io
./sync-images.sh
```

This will:
- Copy photos from Desktop to repository
- Generate all necessary JSON data files
- Update the manifest for navigation

### Step 3: Test locally

Open `index.html` in your browser to preview changes.

### Step 4: Deploy to website

```bash
git add .
git commit -m "Update photos"
git push
```

Your changes will be live on cocoyams.com shortly after pushing.

## Tips

- Supported image formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- Folder names in `project/` and `bonus/` become navigation labels
- Use descriptive folder names (they appear on the website)
- The sync script will delete photos from the repo that aren't on Desktop (keeps things in sync)

## Current Setup Status

✓ Repository cloned
✓ Desktop folders created with README files
✓ Old mock images removed
✓ Homepage simplified to hero image only
✓ 3-page structure implemented
✓ Sync script created
✓ Empty data files initialized

## Next Steps

1. Add your real photos to the Desktop folders
2. Run `./sync-images.sh` to sync them
3. Test locally
4. Push to GitHub when ready
