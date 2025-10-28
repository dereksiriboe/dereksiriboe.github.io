# Derek Siriboe — Minimalist Portfolio

A single-page portfolio inspired by [antosh.ca/work](https://antosh.ca/work). All content is driven by JSON files so new work can be published without touching the HTML.

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
│   ├── audio-visual-video.json
│   ├── design-garment.json
│   └── design-ui-ux.json
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
    ├── audio-visual/
    │   ├── sound/
    │   │   └── .gitkeep        # Drop MP3/WAV/OGG files here
    │   └── video/
    │       └── .gitkeep        # Drop MP4/WebM files here
    └── design/
        ├── garment/
        │   ├── look-001.svg
        │   └── look-002.svg
        └── ui-ux/
            ├── mockup-001.svg
            └── mockup-002.svg
```
> **Tip:** The audio/video folders are committed with `.gitkeep` files so Git preserves the empty directories. Replace them with your rendered assets when you're ready to publish.

## 🧭 Navigation Model
- **Homepage** — Displays the hero mosaic and top-level navigation (`style`, `photo`, `audio-visual`, `design`).
- **Hash routing** — Each subsection is addressable, e.g. `#style-private-client`, `#photo-project`, `#audio-visual-video`, `#design-garment`.
- **Sticky header** — On subsection views the contact block remains pinned for quick navigation back to the homepage (click the header).

## 🧾 JSON Content Format
Each JSON file corresponds to a subsection. The SPA expects the following structure:

```jsonc
{
  "rows": [
    {
      "folder": "sunset-series",
      "items": [
        { "file": "images/photo/fun/fun-001.jpg", "alt": "Road trip", "size": "medium" },
        { "type": "accent", "color": "#FF6B35", "size": "small" },
        { "file": "images/photo/fun/fun-002.jpg", "alt": "Sunset over water", "size": "large" }
      ]
    },
    { "spacer": 60 },
    {
      "title": "Custom Header",
      "items": [
        { "type": "spotify", "url": "https://open.spotify.com/track/...", "size": "wide" },
        { "type": "audio", "file": "images/audio-visual/sound/mix-name.mp3", "title": "Mix Name", "size": "medium" }
      ]
    }
  ]
}
```

- Use `folder` to automatically derive the row heading (`sunset-series` → “Sunset Series”).
- Provide `title` to override the heading manually (falls back to `folder` when omitted).
- Insert `{ "spacer": 60 }` objects anywhere in the `rows` array to force additional vertical breathing room.

### Row object keys
| Key | Type | Description |
| --- | --- | --- |
| `folder` | string | Slug used to derive the row heading (e.g. `studio-motion` → “Studio Motion”). |
| `title` | string | Optional explicit heading; overrides the derived value. |
| `items` | array | Collection of media blocks displayed beneath the heading. |

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
- **Images** — Any `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.avif`, `.bmp`. Rendered with lazy loading and `object-fit: cover`; click to open a full-screen lightbox preview.
- **YouTube** — Embeds link to `https://www.youtube.com/watch?v=VIDEO_ID` with the requested thumbnail.
- **Spotify** — Public URLs are converted to the corresponding `https://open.spotify.com/embed/...` iframe.
- **Audio** — HTML5 `<audio>` players with `controls` enabled (optimised for `.mp3`, but `.wav`/`.ogg` also supported).
- **Video** — HTML5 `<video>` player with optional poster frame. Remote MP4/WebM URLs are accepted and expand in the lightbox on click.
- **Accent blocks** — Solid colour blocks for pacing inside the grid.
- **Spacer rows** — Force breaks in the flow to mimic the reference layout.

## ➕ Adding New Work Manually
1. **Upload media**
   - Place stills inside the appropriate folder under `images/`.
   - Drop audio files into `images/audio-visual/sound/`.
   - Drop MP4/WebM clips into `images/audio-visual/video/`.
2. **Edit the JSON**
   - Open the matching file in `data/` (e.g. `photo-fun.json`).
   - Add new media objects to an existing row (`items`) or append a new row object with a unique `folder` slug.
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
  "row": {
    "folder": "backstage-moments",
    "items": [
      {
        "file": "images/photo/project/photo-proj-004.jpg",
        "alt": "Backstage moment",
        "size": "large"
      }
    ]
  }
}
```

### Example Function node snippet
```javascript
// Assume `row` and `subsection` come from the webhook body
return [{
  subsection,
  row: {
    folder: row.folder,
    title: row.title,
    items: row.items
  }
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

## 🌐 Deploying to cocoyams.com with GoDaddy
Follow these steps to publish the site on your custom domain:

1. **Enable GitHub Pages**
   - Open the repository on GitHub.
   - Navigate to **Settings → Pages**.
   - Under **Build and deployment**, choose `Deploy from a branch` and select the branch that hosts your production build (e.g. `main`) and the `/ (root)` folder.
   - Save the settings. GitHub will display a temporary `https://<username>.github.io/<repo>` URL and a status badge once the deploy is ready.

2. **Add the custom domain in GitHub**
   - In the same **Pages** screen, locate the **Custom domain** field.
   - Enter `cocoyams.com` and click **Save**. GitHub automatically generates/updates the `CNAME` file in the repo (this repository already contains one).
   - Wait for the certificate provisioning banner to confirm that HTTPS is active (this can take a few minutes after DNS changes propagate).

3. **Configure DNS at GoDaddy**
   - Sign in to GoDaddy and open **Domain Settings → Manage DNS** for `cocoyams.com`.
   - Replace any existing A records with the four GitHub Pages IPv4 addresses:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Add or edit the `www` CNAME record so the **Host** is `www` and the **Points to** value is `username.github.io` (replace `username` with your GitHub handle, e.g. `dereksiriboe.github.io`).
   - Save the DNS zone changes. GoDaddy may take up to an hour to propagate the updates, but it is often much faster.

4. **Verify the setup**
   - Back on the GitHub Pages settings page, look for the green checkmark indicating that your DNS is correctly configured.
   - Visit both `https://cocoyams.com` and `https://www.cocoyams.com` to confirm they resolve to the portfolio.
   - Optional: use a tool like `https://www.whatsmydns.net/` to confirm the A and CNAME records have propagated globally.

5. **Force HTTPS (recommended)**
   - Once the certificate is issued, toggle **Enforce HTTPS** in GitHub Pages to ensure all traffic is secure.

With these steps complete, future pushes to the configured branch will redeploy automatically to `cocoyams.com`.

Minimal code, maximal white space. Enjoy.
