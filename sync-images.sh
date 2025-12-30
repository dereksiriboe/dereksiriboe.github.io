#!/bin/bash

# Sync images from Desktop folders to repository and generate data files
# Usage: ./sync-images.sh

REPO_DIR="/Users/derek/cocoyams.com/dereksiriboe.github.io"
DESKTOP_DIR="/Users/derek/Desktop"

echo "Syncing images from Desktop to repository..."

# Function to generate JSON for a folder of images
generate_json_for_folder() {
    local folder_path="$1"
    local output_json="$2"

    echo '{"rows": [' > "$output_json"

    first=true
    for img in "$folder_path"/*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG,GIF,WEBP} 2>/dev/null; do
        [ -f "$img" ] || continue

        filename=$(basename "$img")
        relative_path="images/$(basename $(dirname "$output_json"))/$filename"

        if [ "$first" = true ]; then
            first=false
        else
            echo ',' >> "$output_json"
        fi

        echo "    [{\"type\": \"image\", \"file\": \"$relative_path\", \"size\": \"medium\"}]" >> "$output_json"
    done

    echo '' >> "$output_json"
    echo '  ]' >> "$output_json"
    echo '}' >> "$output_json"
}

# Function to generate JSON with subfolders
generate_json_with_subfolders() {
    local base_folder="$1"
    local data_dir="$2"
    local image_dir="$3"

    for subfolder in "$base_folder"/*; do
        [ -d "$subfolder" ] || continue
        [ "$(basename "$subfolder")" = "README.txt" ] && continue

        subfolder_name=$(basename "$subfolder")

        # Copy images to repo
        mkdir -p "$image_dir/$subfolder_name"
        rsync -av --delete "$subfolder/" "$image_dir/$subfolder_name/" --include='*.jpg' --include='*.jpeg' --include='*.png' --include='*.gif' --include='*.webp' --include='*.JPG' --include='*.JPEG' --include='*.PNG' --include='*.GIF' --include='*.WEBP' --exclude='*'

        # Generate JSON
        output_json="$data_dir/$(basename "$base_folder")-$subfolder_name.json"
        echo '{"rows": [' > "$output_json"

        first=true
        for img in "$image_dir/$subfolder_name"/*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG,GIF,WEBP} 2>/dev/null; do
            [ -f "$img" ] || continue

            filename=$(basename "$img")
            relative_path="images/$(basename "$base_folder")/$subfolder_name/$filename"

            if [ "$first" = true ]; then
                first=false
            else
                echo ',' >> "$output_json"
            fi

            echo "    [{\"type\": \"image\", \"file\": \"$relative_path\", \"size\": \"medium\"}]" >> "$output_json"
        done

        echo '' >> "$output_json"
        echo '  ]' >> "$output_json"
        echo '}' >> "$output_json"

        echo "  Created: $output_json"
    done
}

# 1. Sync NATURAL photos (all in one folder)
echo ""
echo "1. Syncing NATURAL photos..."
rsync -av --delete "$DESKTOP_DIR/natural/" "$REPO_DIR/images/natural/" --include='*.jpg' --include='*.jpeg' --include='*.png' --include='*.gif' --include='*.webp' --include='*.JPG' --include='*.JPEG' --include='*.PNG' --include='*.GIF' --include='*.WEBP' --exclude='*'
generate_json_for_folder "$REPO_DIR/images/natural" "$REPO_DIR/data/natural.json"
echo "  Created: data/natural.json"

# 2. Sync PROJECT photos (subfolders)
echo ""
echo "2. Syncing PROJECT photos..."
generate_json_with_subfolders "$DESKTOP_DIR/project" "$REPO_DIR/data" "$REPO_DIR/images/project"

# 3. Sync BONUS photos (subfolders)
echo ""
echo "3. Syncing BONUS photos..."
generate_json_with_subfolders "$DESKTOP_DIR/bonus" "$REPO_DIR/data" "$REPO_DIR/images/bonus"

# 4. Generate manifest.json
echo ""
echo "4. Generating manifest.json..."
echo '{' > "$REPO_DIR/data/manifest.json"
echo '  "project": [' >> "$REPO_DIR/data/manifest.json"

first=true
for subfolder in "$DESKTOP_DIR/project"/*; do
    [ -d "$subfolder" ] || continue
    [ "$(basename "$subfolder")" = "README.txt" ] && continue

    subfolder_name=$(basename "$subfolder")

    if [ "$first" = true ]; then
        first=false
    else
        echo ',' >> "$REPO_DIR/data/manifest.json"
    fi

    echo -n "    \"$subfolder_name\"" >> "$REPO_DIR/data/manifest.json"
done

echo '' >> "$REPO_DIR/data/manifest.json"
echo '  ],' >> "$REPO_DIR/data/manifest.json"
echo '  "bonus": [' >> "$REPO_DIR/data/manifest.json"

first=true
for subfolder in "$DESKTOP_DIR/bonus"/*; do
    [ -d "$subfolder" ] || continue
    [ "$(basename "$subfolder")" = "README.txt" ] && continue

    subfolder_name=$(basename "$subfolder")

    if [ "$first" = true ]; then
        first=false
    else
        echo ',' >> "$REPO_DIR/data/manifest.json"
    fi

    echo -n "    \"$subfolder_name\"" >> "$REPO_DIR/data/manifest.json"
done

echo '' >> "$REPO_DIR/data/manifest.json"
echo '  ]' >> "$REPO_DIR/data/manifest.json"
echo '}' >> "$REPO_DIR/data/manifest.json"

echo "  Created: data/manifest.json"

echo ""
echo "✓ Sync complete!"
echo ""
echo "Next steps:"
echo "  1. Review the generated files in data/ folder"
echo "  2. Test locally by opening index.html in a browser"
echo "  3. Commit and push changes to deploy"
