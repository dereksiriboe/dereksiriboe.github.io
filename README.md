# Derek Siriboe Portfolio Website

A minimalist portfolio website with auto-loading image galleries organized by folders.

## 🌐 Live Site
Visit: [cocoyams.com](https://cocoyams.com)

## 📁 How It Works

This website automatically loads images from folders to create gallery rows. Each folder represents a different project, location, or time period.

### Folder Structure
```
your-repo/
├── index.html
├── favicon.ico
├── images/
│   ├── leisure/
│   │   ├── tokyo-2024/          ← Each folder = one row
│   │   │   ├── 1.jpg            ← Any image names work
│   │   │   ├── 2.jpg
│   │   │   └── 3.jpg
│   │   ├── la-beaches/
│   │   │   ├── photo1.jpg
│   │   │   └── photo2.jpg
│   │   └── weekend-vibes/
│   │       ├── IMG_001.png
│   │       └── IMG_002.png
│   └── project/
│       ├── stussy-campaign/
│       │   ├── shot1.jpg
│       │   └── shot2.jpg
│       ├── thrasher-shoot/
│       │   ├── image1.png
│       │   └── image2.png
│       └── nike-collaboration/
│           ├── pic1.jpg
│           └── pic2.jpg
```

## ✨ Features

- **Responsive Design** - Looks great on desktop, tablet, and mobile
- **Auto-Loading** - No need to edit HTML when adding images
- **Flexible Naming** - Use any image file names you want
- **Visual Variety** - Automatic mixed sizing (small, medium, large, tall, wide)
- **Fast Loading** - Lazy loading for better performance
- **Clean Design** - Minimalist aesthetic inspired by antosh.ca

## 🚀 Adding New Content

### Step 1: Create a New Folder
1. Go to your GitHub repository
2. Navigate to `images/leisure/` or `images/project/`
3. Click "Create new file"
4. Type: `your-folder-name/placeholder.txt` (this creates the folder)
5. Commit the file

### Step 2: Upload Images
1. Go into your new folder
2. Click "Add file" → "Upload files"
3. Drag and drop your images
4. Use any file names you want (1.jpg, photo1.png, IMG_001.jpeg, etc.)
5. Commit the upload

### Step 3: Update the Folder List
1. Open `index.html`
2. Find the JavaScript section with `folderStructure`
3. Add your folder name to the appropriate array:

```javascript
const folderStructure = {
    leisure: [
        'tokyo-2024',
        'la-beaches',
        'weekend-vibes',
        'your-new-folder',    ← Add here
    ],
    project: [
        'stussy-campaign',
        'thrasher-shoot',
        'nike-collaboration',
        'your-new-project',   ← Add here
    ]
};
```

4. Commit the changes

### Step 4: Wait & Refresh
- Changes go live in 1-10 minutes
- Visit your site and click leisure/project to see new images

## 📱 Supported Image Formats
- JPG/JPEG
- PNG
- WebP
- GIF

## 🎨 Customization

### Changing Contact Info
Edit these lines in `index.html`:
```html
<div class="name">Derek Siriboe</div>
<div class="location">New York, NY</div>
<div class="email">
    <a href="mailto:asap@cocoyams.com">asap@cocoyams.com</a>
</div>
```

### Adding a Favicon
1. Create a 32x32px image of your logo/initials
2. Save as `favicon.ico`
3. Upload to your repository root folder
4. It will appear automatically

### Changing Colors/Fonts
Edit the CSS section in `index.html`:
```css
body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    background-color: #ffffff;
    color: #000000;
}
```

## 🔧 Management Options

### Option 1: GitHub Web Interface (Easiest)
- Edit files directly on GitHub.com
- Good for quick text changes
- Upload images by dragging into folders

### Option 2: GitHub Desktop (Recommended)
1. Download GitHub Desktop
2. Clone your repository to your computer
3. Edit files locally
4. Add images by dragging into local folders
5. Commit and push changes

### Option 3: VS Code + GitHub
- Full development environment
- Syntax highlighting
- Live preview
- Advanced Git features

## 📝 Tips

### Organization Ideas
**Leisure folders:**
- `tokyo-2024`, `paris-summer`, `LA-beaches`
- `friends-hanging`, `weekend-vibes`, `travel-2024`
- `concerts`, `restaurants`, `adventures`

**Project folders:**
- `brand-campaign`, `editorial-shoot`, `street-portraits`
- `client-work`, `personal-projects`, `collaborations`
- `fashion-week`, `music-videos`, `advertisements`

### Best Practices
- **Folder names**: Use lowercase with dashes (e.g., `tokyo-2024`)
- **Image size**: Keep images under 5MB for fast loading
- **Aspect ratios**: Mix portrait and landscape for visual variety
- **Quality**: Use high-quality images - they'll be resized automatically

## 🐛 Troubleshooting

**Images not showing?**
- Check folder names match exactly in the JavaScript `folderStructure`
- Ensure images are in correct folder path
- Verify image file extensions are supported

**Site not updating?**
- Wait 5-10 minutes for GitHub Pages to rebuild
- Clear your browser cache
- Check that changes were committed to main branch

**Mobile not working?**
- The site is fully responsive
- Test on actual devices, not just browser resize

## 📞 Support

If you need help:
1. Check the troubleshooting section above
2. Look at your repository's Actions tab for deployment errors
3. Compare your folder structure to the example
4. Make sure all folder names are added to the JavaScript section

---

**Made with ❤️ for easy portfolio management**
