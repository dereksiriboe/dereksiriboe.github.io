# Derek Siriboe —  Portfolio

## 📁 Repository Layout
```
repo-root/
├── index.html                  # Vanilla HTML/CSS/JS single-page application
├── favicon.ico
├── README.md
├── data/                       # JSON data sources consumed by the SPA
│   ├── style-private-client.json
│   ├── style-project.json
│   ├── photo-fun.json
│   ├── photo-project.json
│   ├── audio-visual-sound.json
│   └── audio-visual-video.json
└── images/
    ├── hero/
    │   └── hero.jpg            # Featured landing imagery (optional reference)
    ├── style/
    │   ├── private-client/
    │   │   ├── client-001.jpg
    │   │   ├── client-002.jpg
    │   │   └── client-003.jpg
    │   └── project/
    │       ├── project-001.jpg
    │       ├── project-002.jpg
    │       └── project-003.jpg
    ├── photo/
    │   ├── fun/
    │   │   ├── fun-001.jpg
    │   │   ├── fun-002.jpg
    │   │   └── fun-003.jpg
    │   └── project/
    │       ├── photo-proj-001.jpg
    │       ├── photo-proj-002.jpg
    │       └── photo-proj-003.jpg
    └── audio-visual/
        ├── sound/
        │   └── .gitkeep        # Drop MP3/WAV/OGG files here
        └── video/
            └── .gitkeep        # Drop MP4/WebM files here
```
> **Tip:** The audio/video folders are committed with `.gitkeep` files so Git preserves the empty directories. Replace them with your rendered assets when you're ready to publish.

## 🧭 Navigation Model
- **Homepage** — Displays the hero mosaic and top-level navigation (`style`, `photo`, `audio-visual`).
- **Hash routing** — Each subsection is addressable, e.g. `#style-private-client`, `#photo-project`, `#audio-visual-video`.
- **Sticky header** — On subsection views the contact block remains pinned for quick navigation back to the homepage (click the header).

## 🧾 JSON Content Format
Each JSON file corresponds to a subsection. The SPA expects the following structure:

```jsonc
{
  "rows": [
    [
      { "file": "images/style/private-client/client-001.jpg", "alt": "Portrait", "size": "large" },
      { "type": "accent", "color": "#FF6B35", "size": "small" },
      { "type": "youtube", "videoId": "dQw4w9WgXcQ", "thumbnail": "auto", "size": "large" }
    ],
    { "spacer": 60 },
    [
      { "type": "spotify", "url": "https://open.spotify.com/track/...", "size": "wide" },
      { "type": "audio", "file": "images/audio-visual/sound/mix-name.mp3", "title": "Mix Name", "size": "medium" }
    ]
  ]
}
```

### Supported item keys
| Key | Type | Description |
| --- | --- | --- |
| `file` | string | Path to a media asset (image, audio, or video) or absolute URL. |
| `alt` | string | Accessible alt text for images. |
| `size` | string | One of `small`, `medium`, `large`, `tall`, `wide`. Defaults to `medium`. |
| `type` | string | Overrides automatic detection. Supports `image`, `accent`, `youtube`, `spotify`, `audio`, `video`. |
| `color` | string | Hex value for accent blocks (`#FF6B35` by default). |
| `videoId` | string | YouTube video ID. Required when `type` is `youtube`. |
| `thumbnail` | string | `auto` to load the default YouTube thumbnail or provide a custom image path/URL. |
| `url` | string | Spotify public URL. Automatically converted to the correct embed URL. |
| `title` | string | Optional tooltip/title for audio players. |
| `poster` | string | Poster image for HTML5 video players. |
| `spacer` | number | Inserts vertical whitespace (`flex-basis: 100%`) with the specified pixel height. |

### Media handling rules
- **Images** — Any `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.avif`, `.bmp`. Rendered with lazy loading and `object-fit: cover`.
- **YouTube** — Embeds link to `https://www.youtube.com/watch?v=VIDEO_ID` with the requested thumbnail.
- **Spotify** — Public URLs are converted to the corresponding `https://open.spotify.com/embed/...` iframe.
- **Audio** — HTML5 `<audio>` players with `controls` enabled (optimised for `.mp3`, but `.wav`/`.ogg` also supported).
- **Video** — HTML5 `<video>` player with optional poster frame. Remote MP4/WebM URLs are accepted.
- **Accent blocks** — Solid colour blocks for pacing inside the grid.
- **Spacer rows** — Force breaks in the flow to mimic the reference layout.

## ➕ Adding New Work Manually
1. **Upload media**
   - Place stills inside the appropriate folder under `images/`.
   - Drop audio files into `images/audio-visual/sound/`.
   - Drop MP4/WebM clips into `images/audio-visual/video/`.
2. **Edit the JSON**
   - Open the matching file in `data/` (e.g. `photo-fun.json`).
   - Add new items to an existing row or append a new row array.
   - Commit the change. The SPA will automatically pick it up.
3. **Verify locally or on GitHub Pages**
   - Navigate to the relevant hash (e.g. `#/photo-fun`) to confirm layout and media playback.

### Size guidelines
Use the `size` property to fine tune the grid rhythm:
- `small` — 80×80
- `medium` — 120×80
- `large` — 160×80
- `tall` — 80×120
- `wide` — 200×80

On smaller breakpoints each dimension scales proportionally to maintain the mosaic.

## 🤖 Automating with n8n
Because every section is JSON-driven, an n8n workflow can update the site by editing a single file.

### Example workflow outline
1. **Trigger:** Webhook node (POST from a form or Airtable automation).
2. **Function:** Map the incoming payload into a grid item object.
3. **HTTP Request:** Use the GitHub API to fetch, modify, and commit the target JSON file.

### Sample webhook payload
```json
{
  "subsection": "photo-project",
  "item": {
    "file": "images/photo/project/photo-proj-004.jpg",
    "alt": "Backstage moment",
    "size": "large"
  }
}
```

### Example Function node snippet
```javascript
// Assume `item` and `subsection` come from the webhook body
const row = [{ ...item }];
return [{
  subsection,
  row
}];
```

### GitHub API append (HTTP Request node)
```
PATCH https://api.github.com/repos/<owner>/<repo>/contents/data/photo-project.json
Authorization: token <GITHUB_TOKEN>
Content-Type: application/json

{
  "message": "Add new photo-project tile",
  "content": "<base64-encoded updated JSON>",
  "sha": "<current file sha>"
}
```

Use the Function node to merge the existing `rows` array with the new `row`, then base64-encode the result before hitting the API. The SPA automatically fetches the fresh JSON on the next page load.

## 🧪 Local Testing
Serve the repository with any static web server (e.g. `python -m http.server`) and visit `http://localhost:8000`. Hash-based routing works without build tools.

## ✅ Launch Checklist
- [ ] Replace placeholder audio/video assets with production files.
- [ ] Update contact details in the header.
- [ ] Confirm JSON entries reference the new media paths.
- [ ] Push to `main` for GitHub Pages to redeploy.

Minimal code, maximal white space. Enjoy.
