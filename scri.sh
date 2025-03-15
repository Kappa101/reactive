#!/bin/bash

GROUP_ID="HIVV_SOE"  # Update with your group name or ID
TOKEN="YOUR_PERSONAL_ACCESS_TOKEN"
BASE_URL="https://gitlab.com/api/v4"

OUTPUT_FILE="combined_package_data.json"

# Start JSON Object
echo "{" > $OUTPUT_FILE

# Get all projects in the group
PROJECTS=$(curl --header "PRIVATE-TOKEN: $TOKEN" "$BASE_URL/groups/$GROUP_ID/projects" | jq -r '.[].id')

for PROJECT_ID in $PROJECTS; do
    # Get project name
    PROJECT_NAME=$(curl --header "PRIVATE-TOKEN: $TOKEN" "$BASE_URL/projects/$PROJECT_ID" | jq -r '.name')

    # Get default branch
    DEFAULT_BRANCH=$(curl --header "PRIVATE-TOKEN: $TOKEN" "$BASE_URL/projects/$PROJECT_ID" | jq -r '.default_branch')

    # Fetch package.json
    PACKAGE_JSON=$(curl --header "PRIVATE-TOKEN: $TOKEN" "$BASE_URL/projects/$PROJECT_ID/repository/files/package.json/raw?ref=$DEFAULT_BRANCH")

    if [[ -n "$PACKAGE_JSON" ]]; then
        echo "package.json found in $PROJECT_NAME"

        # Append JSON object for this project (ensuring proper structure)
        echo "\"$PROJECT_NAME\": $PACKAGE_JSON," >> $OUTPUT_FILE
    else
        echo "No package.json found for $PROJECT_NAME"
    fi
done

# Remove last comma and close JSON object
sed -i '$ s/,$//' $OUTPUT_FILE
echo "}" >> $OUTPUT_FILE

echo "✅ Combined package.json data saved to $OUTPUT_FILE"
