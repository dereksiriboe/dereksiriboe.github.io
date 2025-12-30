#!/bin/bash

# Generate data files from images already in the repository
# Usage: ./generate-data.sh

REPO_DIR="/Users/derek/cocoyams.com/dereksiriboe.github.io"

echo "Generating data files from repository images..."

# Function to generate JSON for a folder of images
generate_json_for_folder() {
    local folder_path="$1"
    local output_json="$2"
    local base_path="$3"

    echo '{"rows": [' > "$output_json"

    first=true
    for img in "$folder_path"/*; do
        [ -f "$img" ] || continue

        # Check if file has valid image extension
        case "${img##*.}" in
            jpg|jpeg|png|gif|webp|JPG|JPEG|PNG|GIF|WEBP) ;;
            *) continue ;;
        esac

        filename=$(basename "$img")
        relative_path="$base_path/$filename"

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
    local image_base="$1"
    local data_dir="$2"
    local section_name="$3"

    for subfolder in "$image_base"/*; do
        [ -d "$subfolder" ] || continue

        subfolder_name=$(basename "$subfolder")

        # Generate JSON
        output_json="$data_dir/${section_name}-${subfolder_name}.json"
        echo '{"rows": [' > "$output_json"

        first=true
        for img in "$subfolder"/*; do
            [ -f "$img" ] || continue

            # Check if file has valid image extension
            case "${img##*.}" in
                jpg|jpeg|png|gif|webp|JPG|JPEG|PNG|GIF|WEBP) ;;
                *) continue ;;
            esac

            filename=$(basename "$img")
            # Map section_name: 'project' should look in 'library' folder
            local image_folder="$section_name"
            if [ "$section_name" = "project" ]; then
                image_folder="library"
            fi
            relative_path="images/${image_folder}/${subfolder_name}/$filename"

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

        echo "  Created: $(basename "$output_json")"
    done
}

# 1. Generate NATURAL photos JSON
echo ""
echo "1. Generating natural.json..."
generate_json_for_folder "$REPO_DIR/images/natural" "$REPO_DIR/data/natural.json" "images/natural"
echo "  Created: natural.json"

# 2. Generate LIBRARY photos JSONs (formerly project)
echo ""
echo "2. Generating library data files..."
generate_json_with_subfolders "$REPO_DIR/images/library" "$REPO_DIR/data" "project"

# 3. Generate BONUS photos JSONs
echo ""
echo "3. Generating bonus data files..."
generate_json_with_subfolders "$REPO_DIR/images/bonus" "$REPO_DIR/data" "bonus"

# 4. Generate manifest.json
echo ""
echo "4. Generating manifest.json..."
echo '{' > "$REPO_DIR/data/manifest.json"
echo '  "project": [' >> "$REPO_DIR/data/manifest.json"

first=true
for subfolder in "$REPO_DIR/images/library"/*; do
    [ -d "$subfolder" ] || continue

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
for subfolder in "$REPO_DIR/images/bonus"/*; do
    [ -d "$subfolder" ] || continue

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

echo "  Created: manifest.json"

echo ""
echo "✓ Data generation complete!"
echo ""
echo "Next steps:"
echo "  1. Review the generated files in data/ folder"
echo "  2. Test locally by opening index.html in a browser"
echo "  3. Commit and push changes to deploy"
