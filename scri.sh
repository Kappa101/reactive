#!/bin/bash

# GitLab Configuration
GITLAB_API_URL="https://gitlab.com/api/v4"
GROUP_NAME=""  # Replace with your GitLab group name
ACCESS_TOKEN="your_personal_access_token"  # Replace with your GitLab access token

# Output files
ALL_DEPS_FILE="all_dependencies.json"
FILTERED_DEPS_FILE="filtered_dependencies.json"
MISSING_REPOS_LOG="missing_repos.log"

# Clear previous data
echo "{" > "$ALL_DEPS_FILE"
echo "{" > "$FILTERED_DEPS_FILE"
> "$MISSING_REPOS_LOG"

PAGE=1
PER_PAGE=100
ALL_REPOS=()

echo "Fetching repositories from GitLab..."

# Fetch all repositories from the GitLab group (handling pagination)
while true; do
    RESPONSE=$(curl --silent --header "PRIVATE-TOKEN: $ACCESS_TOKEN" "$GITLAB_API_URL/groups/$GROUP_NAME/projects?per_page=$PER_PAGE&page=$PAGE")

    REPO_NAMES=$(echo "$RESPONSE" | jq -r '.[].path_with_namespace' | grep "mfe-assisted")

    if [ -z "$REPO_NAMES" ]; then
        break  # No more repositories to fetch
    fi

    ALL_REPOS+=($REPO_NAMES)
    ((PAGE++))
done

echo "Found ${#ALL_REPOS[@]} repositories matching 'mfe-assisted'."

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

    # Append to the all dependencies file
    echo "\"$repo\": $EXTRACTED_JSON," >> "$ALL_DEPS_FILE"

    # Extract dependencies starting with "vz-soe-utils" or "vzrf"
    FILTERED_DEPS=$(echo "$PACKAGE_JSON" | jq '{dependencies, devDependencies} | map_values(with_entries(select(.key | startswith("vz-soe-utils") or startswith("vzrf"))))')

    if [[ "$FILTERED_DEPS" != "{}" ]]; then
        echo "\"$repo\": $FILTERED_DEPS," >> "$FILTERED_DEPS_FILE"
    fi
done

# Remove trailing commas and close JSON objects
sed -i '$ s/,$//' "$ALL_DEPS_FILE"
sed -i '$ s/,$//' "$FILTERED_DEPS_FILE"
echo "}" >> "$ALL_DEPS_FILE"
echo "}" >> "$FILTERED_DEPS_FILE"

echo "✅ Extracted dependencies saved to $ALL_DEPS_FILE"
echo "✅ Filtered dependencies saved to $FILTERED_DEPS_FILE"
echo "⚠️ Missing repositories logged in $MISSING_REPOS_LOG"
