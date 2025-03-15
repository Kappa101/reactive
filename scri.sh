#!/bin/bash

# GitLab Configuration
GITLAB_API_URL="https://gitlab.com/api/v4"
GROUP_NAME="HIVV_SOE"  # Replace with your GitLab group name
ACCESS_TOKEN="your_personal_access_token"  # Replace with your token

# Output files
OUTPUT_FILE="combined_package_data.json"
MISSING_REPOS_LOG="missing_repos.log"

# Clear previous data
echo "{" > "$OUTPUT_FILE"
> "$MISSING_REPOS_LOG"

PAGE=1
PER_PAGE=100
ALL_REPOS=()

echo "Fetching repositories from GitLab..."

# Fetch all repositories from the GitLab group (handling pagination)
while true; do
    RESPONSE=$(curl --silent --header "PRIVATE-TOKEN: $ACCESS_TOKEN" "$GITLAB_API_URL/groups/$GROUP_NAME/projects?per_page=$PER_PAGE&page=$PAGE")

    REPO_NAMES=$(echo "$RESPONSE" | jq -r '.[].path_with_namespace')

    if [ -z "$REPO_NAMES" ]; then
        break  # No more repositories to fetch
    fi

    ALL_REPOS+=($REPO_NAMES)
    ((PAGE++))
done

echo "Found ${#ALL_REPOS[@]} repositories."

# Loop through each repository and fetch package.json
for repo in "${ALL_REPOS[@]}"; do
    echo "Checking package.json for $repo ..."

    PACKAGE_JSON=$(curl --silent --header "PRIVATE-TOKEN: $ACCESS_TOKEN" "$GITLAB_API_URL/projects/$repo/repository/files/package.json/raw?ref=main")

    if [ -z "$PACKAGE_JSON" ]; then
        echo "⚠️ No package.json found for $repo" >> "$MISSING_REPOS_LOG"
        continue
    fi

    # Extract only dependencies and devDependencies
    EXTRACTED_JSON=$(echo "$PACKAGE_JSON" | jq '{dependencies, devDependencies}')

    # Append to the output file
    echo "\"$repo\": $EXTRACTED_JSON," >> "$OUTPUT_FILE"
done

# Remove trailing comma and close JSON object properly
sed -i '$ s/,$//' "$OUTPUT_FILE"
echo "}" >> "$OUTPUT_FILE"

echo "✅ Extracted dependencies saved to $OUTPUT_FILE"
echo "⚠️ Missing repositories logged in $MISSING_REPOS_LOG"
