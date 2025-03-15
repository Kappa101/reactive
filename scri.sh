#!/bin/bash

GROUP_ID="HIVV_SOE"  # Update with your actual GitLab group ID or name
TOKEN="YOUR_PERSONAL_ACCESS_TOKEN"
BASE_URL="https://gitlab.com/api/v4"

OUTPUT_FILE="combined_package_data.json"

# Start JSON object
echo "{" > $OUTPUT_FILE

# Get all projects in the group that contain "mfe-assisted"
PROJECTS=$(curl --silent --header "PRIVATE-TOKEN: $TOKEN" "$BASE_URL/groups/$GROUP_ID/projects" | jq -r '.[] | select(.name | contains("mfe-assisted")) | .id')

if [[ -z "$PROJECTS" ]]; then
    echo "❌ No repositories found with 'mfe-assisted' in the name."
    exit 1
fi

for PROJECT_ID in $PROJECTS; do
    # Get project details
    PROJECT_INFO=$(curl --silent --header "PRIVATE-TOKEN: $TOKEN" "$BASE_URL/projects/$PROJECT_ID")
    PROJECT_NAME=$(echo "$PROJECT_INFO" | jq -r '.name')
    DEFAULT_BRANCH=$(echo "$PROJECT_INFO" | jq -r '.default_branch')

    echo "🔍 Checking $PROJECT_NAME..."

    # Fetch package.json from the default branch
    PACKAGE_JSON=$(curl --silent --header "PRIVATE-TOKEN: $TOKEN" "$BASE_URL/projects/$PROJECT_ID/repository/files/package.json/raw?ref=$DEFAULT_BRANCH")

    if [[ -n "$PACKAGE_JSON" && "$PACKAGE_JSON" != "null" ]]; then
        echo "✅ Found package.json for $PROJECT_NAME"
        
        # Append package.json data as JSON
        echo "\"$PROJECT_NAME\": $PACKAGE_JSON," >> $OUTPUT_FILE
    else
        echo "⚠️ No package.json found for $PROJECT_NAME"
    fi
done

# Remove last comma and close JSON object
sed -i '$ s/,$//' $OUTPUT_FILE
echo "}" >> $OUTPUT_FILE

echo "📄 Combined package.json data saved to $OUTPUT_FILE"
